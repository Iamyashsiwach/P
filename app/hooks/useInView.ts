'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Stop observing after the first intersection. */
  once?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useInView<T extends Element = HTMLDivElement>({
  once = true,
  rootMargin = '0px',
  threshold = 0,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, inView };
}
