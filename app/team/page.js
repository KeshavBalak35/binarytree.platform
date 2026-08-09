import Link from "next/link";
import { TEAM } from "@/lib/organization";

export const metadata = {
  title: "Our team",
  description: "Meet the people leading Binary Tree’s education, curriculum, international programs, open-source technology, and community work.",
};

export default function TeamPage() {
  return (
    <main id="main-content">
      <section className="organization-hero team-hero">
        <div className="container organization-hero-grid" data-reveal>
          <div>
            <p className="eyebrow">The people behind Binary Tree</p>
            <h1>A small team, building for a much bigger classroom.</h1>
            <p>Binary Tree brings education, international partnerships, curriculum design, AI, open source, and youth programs into one shared mission: useful learning that reaches people wherever they are.</p>
          </div>
          <div className="organization-hero-note" aria-label={`${TEAM.length} team members`}>
            <span>Leadership note</span><strong>{TEAM.length} people</strong><p>One practical, access-first mission.</p>
          </div>
        </div>
      </section>

      <section className="organization-section" aria-labelledby="team-list-heading">
        <div className="container">
          <div className="organization-heading" data-reveal>
            <div><p className="eyebrow">Leadership team</p><h2 id="team-list-heading">Different specialties. Shared responsibility.</h2></div>
            <p>Each person’s official role is listed exactly as it is held within Binary Tree.</p>
          </div>
          <div className="team-list">
            {TEAM.map((person, index) => (
              <article className="team-person" data-reveal style={{ "--person-tilt": `${index % 2 ? 0.45 : -0.45}deg` }} key={person.name}>
                <div className="team-initials" aria-hidden="true">{person.initials}</div>
                <div className="team-person-copy"><span>{person.group}</span><h2>{person.name}</h2><p>{person.role}</p></div>
                <span className="team-person-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="organization-cta">
        <div className="container organization-cta-inner" data-reveal>
          <div><p className="eyebrow">Add your branch</p><h2>Want to build with this team?</h2><p>Tell us what you care about, what you can contribute, and where you hope to make an impact.</p></div>
          <div className="organization-cta-actions"><Link className="button button-light" href="/apply">Apply to join</Link><Link className="button button-outline-light" href="/partners">Meet our partners</Link></div>
        </div>
      </section>
    </main>
  );
}
