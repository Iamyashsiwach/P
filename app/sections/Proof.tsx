import { proof } from '@/app/lib/content';
import { getGithub, getRecentActivity } from '@/app/lib/github';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';
import { ProofLive } from './ProofLive';

/**
 * Async server component: getGithub()/getRecentActivity() run on the server,
 * so real data (or an honest failure) is in the initial HTML — no loading
 * spinner, and crawlers see the numbers. ProofLive then keeps it current
 * while the section is on screen.
 */
export async function Proof() {
  const [result, activityResult] = await Promise.all([getGithub(), getRecentActivity()]);

  return (
    <section id="proof" aria-labelledby="proof-heading" className="section-rhythm">
      <div className="grid-shell">
        <SectionHeading id="proof-heading" eyebrow={proof.eyebrow} title={proof.heading} />
        <ProofLive
          initialStats={result.ok ? result.data : null}
          initialActivity={activityResult.ok ? activityResult.data : null}
        />
      </div>
    </section>
  );
}

export default Proof;
