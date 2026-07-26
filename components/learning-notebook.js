export function LearningNotebook({ lessonCount }) {
  return (
    <div className="learning-notebook" aria-label={`A learner's notebook showing a path through ${lessonCount} practical lessons`}>
      <span className="notebook-tape notebook-tape-top" aria-hidden="true" />
      <span className="notebook-thread" aria-hidden="true" />
      <div className="notebook-page">
        <p className="notebook-hand">today&apos;s small step</p>
        <h2>Make one useful thing.</h2>
        <ol>
          <li className="is-done"><span>✓</span><div><strong>Learn the idea</strong><small>clear notes, no jargon</small></div></li>
          <li className="is-current"><span>2</span><div><strong>Try it yourself</strong><small>paper, phone, or computer</small></div></li>
          <li><span>3</span><div><strong>Explain it back</strong><small>make the learning yours</small></div></li>
        </ol>
        <p className="notebook-margin-note">messy attempts<br />still count ↗</p>
        <span className="notebook-scribble" aria-hidden="true">~~~~~</span>
      </div>
      <aside className="notebook-sticky">
        <span>remember</span>
        <strong>Progress can be quiet.</strong>
        <small>{lessonCount} chances to keep going</small>
      </aside>
      <span className="skill-scrap skill-scrap-one">python</span>
      <span className="skill-scrap skill-scrap-two">ideas → action</span>
      <span className="skill-scrap skill-scrap-three">offline ✓</span>
    </div>
  );
}
