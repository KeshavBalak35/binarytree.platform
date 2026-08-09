function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  return `${Math.floor(safe / 60)}:${String(Math.floor(safe % 60)).padStart(2, "0")}`;
}

export function LectureGuide({ video }) {
  return (
    <section className="lecture-guide" id="guide" aria-labelledby="lecture-guide-title">
      <header className="lecture-guide-header">
        <div>
          <p className="eyebrow">Complete lecture guide</p>
          <h2 id="lecture-guide-title">The lesson, unpacked</h2>
          <p>{video.guideIntroduction}</p>
        </div>
        <div className="lecture-source-note">
          <span>Source reviewed</span>
          <strong>{video.durationLabel} lecture</strong>
          <small>{video.sourceNote}</small>
          {video.references?.length > 0 && <div className="lecture-reference-links">{video.references.map((reference) => <a href={reference.url} target="_blank" rel="noreferrer" key={reference.url}>{reference.label} ↗</a>)}</div>}
        </div>
      </header>

      <div className="lecture-guide-sections">
        {video.guide.map((section, index) => (
          <article className="lecture-guide-section" key={`${section.time}-${section.title}`}>
            <div className="lecture-guide-rail">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <small>{formatTime(section.time)}</small>
            </div>
            <div>
              <h3>{section.title}</h3>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.example && <div className="lecture-example"><strong>{section.example.label || "Worked example"}</strong><p>{section.example.text}</p></div>}
              {section.checklist?.length > 0 && <ul className="lecture-checklist">{section.checklist.map((item) => <li key={item}>{item}</li>)}</ul>}
              {section.practice && <div className="lecture-practice"><strong>Try it now</strong><p>{section.practice}</p></div>}
            </div>
          </article>
        ))}
      </div>

      <div className="lecture-review-grid">
        <div className="lecture-glossary">
          <p className="eyebrow">Language of the lesson</p>
          <h2>Know these ideas</h2>
          <dl>{video.glossary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl>
        </div>
        <div className="lecture-misconceptions">
          <p className="eyebrow">Reason like a practitioner</p>
          <h2>Misconceptions to correct</h2>
          <ul>{video.misconceptions.map((item) => <li key={item.myth}><strong>{item.myth}</strong><span>{item.reality}</span></li>)}</ul>
          <div className="lecture-transfer"><strong>Transfer challenge</strong><p>{video.transferChallenge}</p></div>
        </div>
      </div>
    </section>
  );
}
