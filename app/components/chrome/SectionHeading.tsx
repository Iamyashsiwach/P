import { Reveal } from '@/app/components/motion/Reveal';

/**
 * Every section opens the same way: mono eyebrow, display title, and the
 * hairline running out past the text. Asymmetric and left-aligned by default —
 * the centred stack is the template tell this design is avoiding.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
}: {
  id: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="col-span-12">
      <p className="mono-label">{eyebrow}</p>
      <Reveal as="h2" by="lines" className="mt-6 max-w-4xl font-display text-display-l text-ink">
        <span id={id}>{title}</span>
      </Reveal>
      <hr className="rule mt-10" />
    </div>
  );
}

export default SectionHeading;
