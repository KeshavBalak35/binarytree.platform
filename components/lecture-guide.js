function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  return `${Math.floor(safe / 60)}:${String(Math.floor(safe % 60)).padStart(2, "0")}`;
}

function sectionForChapter(guide, chapter) {
  return guide.reduce((closest, section) => (section.time <= chapter.time ? section : closest), guide[0]);
}

export function LectureGuide({ video }) {
  return (
    <section className="lecture-guide" id="guide" aria-labelledby="lecture-guide-title" data-reveal>
      <header className="lecture-guide-header">
        <div><p className="eyebrow">Chapter-by-chapter lecture notebook</p><h2 id="lecture-guide-title">Everything in the video, organized for learning</h2><p>{video.guideIntroduction}</p></div>
        <div className="lecture-source-note"><span>Source reviewed</span><strong>{video.durationLabel} lecture</strong><small>{video.sourceNote}</small>{video.references?.length > 0 && <div className="lecture-reference-links">{video.references.map((reference) => <a href={reference.url} target="_blank" rel="noreferrer" key={reference.url}>{reference.label} ↗</a>)}</div>}</div>
      </header>

      {video.chapters?.length > 0 && (
        <div className="chapter-notebook">
          <div className="chapter-notebook-intro"><div><span>{video.chapters.length}</span><p>video chapters mapped into notes, examples, and a concrete action.</p></div><small>This is a detailed learning companion reconstructed from the reviewed lecture—not a verbatim transcript.</small></div>
          <div className="chapter-notebook-list">
            {video.chapters.map((chapter, index) => {
              const section = sectionForChapter(video.guide, chapter);
              const timestampUrl = `${video.watchUrl}${video.watchUrl.includes("?") ? "&" : "?"}t=${chapter.time}s`;
              return (
                <details className="chapter-note" open={index === 0} key={`${chapter.time}-${chapter.title}`}>
                  <summary><span>{String(index + 1).padStart(2, "0")}</span><div><small>{formatTime(chapter.time)} in the lecture</small><strong>{chapter.title}</strong></div><i aria-hidden="true">⌄</i></summary>
                  <div className="chapter-note-body">
                    <div><span className="chapter-note-label">What the video is teaching</span>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                    {section.example && <div className="chapter-note-example"><span className="chapter-note-label">What to notice</span><strong>{section.example.label || "Worked example"}</strong><p>{section.example.text}</p></div>}
                    <div className="chapter-note-action"><span className="chapter-note-label">Do this before continuing</span><p>{section.practice || video.transferChallenge}</p></div>
                    <a href={timestampUrl} target="_blank" rel="noreferrer">Replay this chapter on YouTube ↗</a>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      <div className="lecture-section-heading"><p className="eyebrow">Deep explanations</p><h2>The ideas behind each chapter</h2><p>Use these sections when the video moves quickly or you need another example.</p></div>
      <div className="lecture-guide-sections">
        {video.guide.map((section, index) => (
          <article className="lecture-guide-section" key={`${section.time}-${section.title}`}>
            <div className="lecture-guide-rail"><span>{String(index + 1).padStart(2, "0")}</span><small>{formatTime(section.time)}</small></div>
            <div><h3>{section.title}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.example && <div className="lecture-example"><strong>{section.example.label || "Worked example"}</strong><p>{section.example.text}</p></div>}{section.checklist?.length > 0 && <ul className="lecture-checklist">{section.checklist.map((item) => <li key={item}>{item}</li>)}</ul>}{section.practice && <div className="lecture-practice"><strong>Try it now</strong><p>{section.practice}</p></div>}</div>
          </article>
        ))}
      </div>
      <div className="lecture-review-grid">
        <div className="lecture-glossary"><p className="eyebrow">Language of the lesson</p><h2>Know these ideas</h2><dl>{video.glossary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></div>
        <div className="lecture-misconceptions"><p className="eyebrow">Reason like a practitioner</p><h2>Misconceptions to correct</h2><ul>{video.misconceptions.map((item) => <li key={item.myth}><strong>{item.myth}</strong><span>{item.reality}</span></li>)}</ul><div className="lecture-transfer"><strong>Transfer challenge</strong><p>{video.transferChallenge}</p></div></div>
      </div>
    </section>
  );
}
