'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getLenis, scrollToTarget } from '@/app/lib/lenis';
import { resolveCommand, suggestions, type CommandResult } from '@/app/lib/commands';
import {
  key,
  blip,
  enableSound,
  disableSound,
  isSoundEnabled,
  enableMusic,
  disableMusic,
  isMusicMuted,
} from '@/app/lib/audio';
import { startRadio } from '@/app/lib/radio';

type LogLine = { id: number; kind: 'input' | 'output'; text: string };

let idCounter = 0;
const nextId = () => idCounter++;

const BOOT_LINES = ['Hi — ask me something, or try one of these:'];

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
}

/**
 * The actual dialog. Lazily mounted by TerminalMount only once the terminal
 * has been opened for the first time, so this component's module (and
 * anything it imports) is never fetched by a visitor who never interacts
 * with it.
 */
export function Terminal({ onRequestClose }: { onRequestClose: () => void }) {
  const [value, setValue] = useState('');
  const [lines, setLines] = useState<LogLine[]>(() =>
    BOOT_LINES.map(text => ({ id: nextId(), kind: 'output' as const, text }))
  );
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Freeze the page behind the dialog and hand focus to the input. Restored
  // on unmount, which happens whenever `open` goes false in TerminalMount.
  useEffect(() => {
    inputRef.current?.focus();
    const main = document.querySelector('main');
    main?.setAttribute('inert', '');
    getLenis()?.stop();
    return () => {
      main?.removeAttribute('inert');
      getLenis()?.start();
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const appendOutput = useCallback((text: string) => {
    setLines(prev => [...prev, { id: nextId(), kind: 'output', text }]);
  }, []);

  const runResult = useCallback(
    (result: CommandResult) => {
      switch (result.kind) {
        case 'text':
          result.lines.forEach(appendOutput);
          return;
        case 'goto':
          result.lines?.forEach(appendOutput);
          // Lenis is stopped for as long as this dialog is open (see the
          // mount effect below) — scrollTo on a stopped instance silently
          // no-ops, so resume it before scrolling. The unmount cleanup
          // calls start() again regardless, which is a harmless no-op.
          getLenis()?.start();
          scrollToTarget(result.href);
          window.setTimeout(onRequestClose, 500);
          return;
        case 'link':
          result.lines?.forEach(appendOutput);
          window.open(result.href, '_blank', 'noopener,noreferrer');
          return;
        case 'sound':
          result.lines?.forEach(appendOutput);
          if (result.next === 'off') disableSound();
          else if (result.next === 'on') enableSound();
          else if (isSoundEnabled()) disableSound();
          else enableSound();
          return;
        case 'music':
          result.lines?.forEach(appendOutput);
          if (result.next === 'off') {
            disableMusic();
          } else if (result.next === 'on') {
            enableMusic();
            startRadio();
          } else if (isMusicMuted()) {
            enableMusic();
            startRadio();
          } else {
            disableMusic();
          }
          return;
        case 'print':
          // Closes first rather than relying solely on the print
          // stylesheet's [data-print-hide] rule for this dialog — the
          // system print dialog popping up over an open terminal reads as
          // a glitch even though the printed output itself is already
          // correct either way.
          window.setTimeout(() => {
            onRequestClose();
            window.print();
          }, 300);
          return;
        case 'clear':
          setLines([]);
          return;
        case 'close':
          result.lines?.forEach(appendOutput);
          window.setTimeout(onRequestClose, 400);
          return;
      }
    },
    [appendOutput, onRequestClose]
  );

  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      setLines(prev => [...prev, { id: nextId(), kind: 'input', text: trimmed }]);
      setHistory(prev => [...prev, trimmed]);
      setHistoryIndex(null);
      setValue('');

      const resolved = resolveCommand(trimmed);
      if (!resolved) {
        const hints = suggestions(trimmed, 3).map(c => c.aliases[0]);
        appendOutput(
          hints.length
            ? `Not sure what that means — try: ${hints.join(', ')}`
            : 'Not sure what that means. Try "help".'
        );
        return;
      }
      blip();
      runResult(resolved.command.run(resolved.args));
    },
    [appendOutput, runResult]
  );

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit(value);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!history.length) return;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next]);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setValue('');
      } else {
        setHistoryIndex(next);
        setValue(history[next]);
      }
    } else if (event.key === 'Escape') {
      onRequestClose();
    }
  };

  // Basic focus trap: Tab/Shift+Tab wraps within the dialog rather than
  // escaping to the page underneath (which is `inert` anyway, but a trap
  // is the correct a11y contract regardless).
  const onDialogKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = focusableElements(dialog);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const chips = suggestions(value);

  return (
    <div
      role="presentation"
      onClick={onRequestClose}
      data-print-hide
      className="fixed inset-0 z-[120] flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-sm sm:items-center sm:pt-0"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site terminal"
        onClick={event => event.stopPropagation()}
        onKeyDown={onDialogKeyDown}
        className="flex max-h-[70vh] w-full max-w-lg flex-col border border-border bg-paper shadow-2xl"
      >
        <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto p-4 font-mono text-sm">
          {lines.map(line => (
            <div key={line.id} className={line.kind === 'input' ? 'text-ink' : 'text-ink-dim'}>
              {line.kind === 'input' ? `> ${line.text}` : line.text}
            </div>
          ))}
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border p-3">
            {chips.map(command => (
              <button
                key={command.id}
                type="button"
                onClick={() => submit(command.aliases[0])}
                className="border border-border px-2 py-1 font-mono text-xs text-ink-mute transition-colors hover:border-ink hover:text-ink"
              >
                {command.aliases[0]}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          <span aria-hidden="true" className="font-mono text-ink-mute">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={event => {
              setValue(event.target.value);
              key();
            }}
            onKeyDown={onInputKeyDown}
            inputMode="text"
            enterKeyHint="go"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Type a command"
            placeholder="ask me something…"
            className="flex-1 bg-transparent font-mono text-sm text-ink outline-none placeholder:text-ink-mute"
          />
          <button
            type="button"
            onClick={onRequestClose}
            aria-label="Close"
            className="font-mono text-ink-mute transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default Terminal;
