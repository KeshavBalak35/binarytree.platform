import Link from "next/link";
import { PARTNERS } from "@/lib/organization";

export const metadata = {
  title: "Partners",
  description: "Meet the community, education, technology, and social-impact organizations partnering with Binary Tree.",
};

export default function PartnersPage() {
  return (
    <main id="main-content">
      <section className="organization-hero partners-hero">
        <div className="container organization-hero-grid" data-reveal>
          <div>
            <p className="eyebrow">Our partner network</p>
            <h1>Local knowledge makes the work real.</h1>
            <p>Binary Tree works alongside organizations already trusted by learners and communities. Together, we connect practical digital education with devices, mentorship, resilience, creativity, and real pathways forward.</p>
          </div>
          <div className="partner-map-note"><span>Across the network</span><strong>{PARTNERS.length} partners</strong><p>Uganda · Tanzania · Zambia · across Africa and beyond</p></div>
        </div>
      </section>

      <section className="organization-section" aria-labelledby="partners-list-heading">
        <div className="container">
          <div className="organization-heading" data-reveal>
            <div><p className="eyebrow">Working together</p><h2 id="partners-list-heading">Partners who bring reach, trust, and expertise.</h2></div>
            <p>Every partnership contributes a different part of the learning ecosystem—from classrooms and devices to data skills and community resilience.</p>
          </div>
          <div className="partner-list">
            {PARTNERS.map((partner, index) => (
              <article className={`partner-note partner-note-${(index % 4) + 1}`} data-reveal key={partner.name}>
                <div className="partner-note-top"><span className="partner-monogram" aria-hidden="true">{partner.shortName}</span><span className="partner-focus">{partner.focus}</span></div>
                <h2>{partner.name}</h2>
                <p>{partner.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="partner-closing">
        <div className="container partner-closing-inner" data-reveal><div><p className="eyebrow">Work with Binary Tree</p><h2>Bring practical learning to more communities.</h2><p>We welcome people and organizations who share an access-first approach to education.</p></div><Link className="button button-primary" href="/apply">Start an application</Link></div>
      </section>
    </main>
  );
}
