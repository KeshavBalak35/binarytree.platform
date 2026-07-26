export function OrganicLearningScene({ lessonCount }) {
  return (
    <div
      className="learning-scene"
      role="img"
      aria-label="A learner following a growing path through digital skills, Python, and artificial intelligence"
    >
      <svg className="learning-scene-art" viewBox="0 0 660 560" aria-hidden="true">
        <defs>
          <linearGradient id="sceneBlob" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#dff7ee" />
            <stop offset="1" stopColor="#dcecff" />
          </linearGradient>
          <linearGradient id="sceneShirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2e82bd" />
            <stop offset="1" stopColor="#165f98" />
          </linearGradient>
        </defs>

        <path
          className="scene-blob scene-blob-main"
          d="M132 78C218 18 348 24 449 67c102 44 169 132 155 237-14 106-109 229-239 238-130 9-296-95-324-224C15 197 48 138 132 78Z"
          fill="url(#sceneBlob)"
        />
        <path
          className="scene-blob scene-blob-orbit"
          d="M510 36c32-18 76-2 88 33 11 35-17 77-55 78-38 0-68-40-54-74 5-15 10-28 21-37Z"
          fill="#ffe4bd"
        />
        <path
          className="scene-learning-path"
          d="M112 376c73 22 102-78 178-63 74 14 70-88 138-88 72 0 83-80 136-98"
          fill="none"
          stroke="#11876b"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          className="scene-path-shadow"
          d="M111 389c74 22 105-76 180-61 73 15 76-84 141-84 72 0 87-77 139-94"
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeWidth="3"
          opacity=".72"
        />

        <g transform="translate(109 378)"><g className="scene-skill-node scene-node-one">
          <circle r="25" fill="#fff" />
          <circle r="18" fill="#11876b" />
          <path d="m-7 0 5 5L8-7" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="3" />
        </g></g>
        <g transform="translate(292 313)"><g className="scene-skill-node scene-node-two">
          <circle r="26" fill="#fff" />
          <circle r="19" fill="#1769aa" />
          <path d="M-7-6h14v12H-7zM-3-10v4m6-4v4" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="2.5" />
        </g></g>
        <g transform="translate(431 224)"><g className="scene-skill-node scene-node-three">
          <circle r="26" fill="#fff" />
          <circle r="19" fill="#735bb1" />
          <circle cx="-6" cy="-3" r="2.5" fill="#fff" />
          <circle cx="6" cy="-3" r="2.5" fill="#fff" />
          <circle cy="7" r="2.5" fill="#fff" />
          <path d="m-4-2 3 7m5-7L1 5" stroke="#fff" strokeWidth="1.8" />
        </g></g>

        <g className="scene-person">
          <path d="M217 447c-2-67 3-117 49-145 39-24 92-15 119 23 25 35 22 86 16 133Z" fill="url(#sceneShirt)" />
          <path d="M301 295c-24-3-41-22-41-47 0-27 22-49 49-49 28 0 51 22 51 49 0 18-10 34-25 43l-3 24-34 1Z" fill="#b96f52" />
          <path d="M261 243c-6-32 15-62 49-65 35-3 62 25 58 59-7-18-20-25-36-28-21-4-43 8-71 34Z" fill="#26364b" />
          <path d="M270 218c11-25 38-42 66-31 13 5 24 15 29 28-18-12-38-14-55-7-17 7-26 19-40 10Z" fill="#26364b" />
          <circle cx="345" cy="246" r="3" fill="#26364b" />
          <path d="M336 269c8 5 16 4 22-2" fill="none" stroke="#7f4538" strokeLinecap="round" strokeWidth="3" />
          <path d="M266 345c-32 19-54 44-72 81" fill="none" stroke="#b96f52" strokeLinecap="round" strokeWidth="19" />
          <path d="M378 346c23 22 39 46 49 78" fill="none" stroke="#b96f52" strokeLinecap="round" strokeWidth="19" />
          <path d="M179 426h264l-30 95H208Z" fill="#fff" />
          <path d="M179 426h264" stroke="#ccdce7" strokeWidth="4" />
          <path d="M281 462c18-14 40-21 64-19" fill="none" stroke="#d3e2ec" strokeLinecap="round" strokeWidth="7" />
          <circle cx="363" cy="453" r="7" fill="#8ee7c5" />
        </g>

        <g className="scene-leaves" fill="#11876b">
          <path d="M79 282c-25-25-20-57 12-67 27 21 22 52-12 67Z" />
          <path d="M92 284c28-26 59-17 66 15-24 26-55 16-66-15Z" opacity=".72" />
          <path d="M531 320c-6-34 18-57 50-44 9 34-17 55-50 44Z" opacity=".75" />
          <path d="M525 331c35-8 57 15 45 47-34 10-57-14-45-47Z" />
        </g>
        <path d="M83 276c12 36 24 71 21 111M533 318c-5 31-7 60 1 91" fill="none" stroke="#11876b" strokeLinecap="round" strokeWidth="4" />
      </svg>

      <div className="scene-float scene-float-digital">
        <span aria-hidden="true">✦</span>
        <div><strong>Digital skills</strong><small>Start with confidence</small></div>
      </div>
      <div className="scene-float scene-float-python">
        <span aria-hidden="true">{"</>"}</span>
        <div><strong>Build with Python</strong><small>Learn by creating</small></div>
      </div>
      <div className="scene-float scene-float-progress">
        <strong>{lessonCount}</strong>
        <span>lessons ready</span>
      </div>
    </div>
  );
}
