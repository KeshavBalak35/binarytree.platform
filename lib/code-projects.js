import { LESSON_PYTHON_PROJECTS } from "./lesson-code-projects.js";

export const WEB_CODE_PROJECTS = [
  {
    id: "profile-card",
    title: "Build a profile card",
    eyebrow: "HTML · CSS · JavaScript",
    description: "Create a welcoming profile card, style it, and make its button respond to a visitor.",
    skills: ["Semantic HTML", "CSS layout", "Click events"],
    files: {
      html: `<main class="profile-card">
  <p class="eyebrow">Hello, world!</p>
  <h1>Amina's first website</h1>
  <p class="intro">I am learning how websites are built, one small experiment at a time.</p>
  <button id="helloButton" type="button">Say hello</button>
  <p id="message" aria-live="polite">Try the button.</p>
</main>`,
      css: `body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #eaf4fb;
  color: #17324d;
  font-family: Arial, sans-serif;
}

.profile-card {
  width: min(100%, 420px);
  padding: 32px;
  border-radius: 24px 12px 28px 14px;
  background: white;
  box-shadow: 0 18px 45px rgba(20, 57, 91, 0.14);
}

.eyebrow {
  color: #1769aa;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 { margin-bottom: 12px; }
.intro { line-height: 1.6; }

button {
  margin-top: 12px;
  padding: 12px 18px;
  border: 0;
  border-radius: 999px;
  background: #1769aa;
  color: white;
  cursor: pointer;
  font-weight: 700;
}

#message { min-height: 24px; margin-bottom: 0; }`,
      js: `const button = document.querySelector("#helloButton");
const message = document.querySelector("#message");

button.addEventListener("click", () => {
  message.textContent = "Hello! You just made this page interactive.";
});`,
    },
    tests: [
      {
        id: "semantic-main",
        title: "Use a main element for the card",
        kind: "source-regex",
        file: "html",
        pattern: "<main(?:\\s|>)",
        flags: "i",
        failure: "Wrap the main experience in a <main> element.",
      },
      {
        id: "profile-visible",
        title: "Show the profile card in the preview",
        kind: "dom-exists",
        selector: ".profile-card",
        failure: "The preview needs an element with class profile-card.",
      },
      {
        id: "button-accessible",
        title: "Give visitors a real button",
        kind: "dom-exists",
        selector: "button#helloButton",
        failure: "Add a <button> with id=\"helloButton\".",
      },
      {
        id: "button-works",
        title: "Make the button change the message",
        kind: "click-changes-text",
        selector: "#helloButton",
        target: "#message",
        failure: "Listen for the button click and update #message text.",
      },
    ],
    hints: [
      "Start with the HTML tab. Each id should be unique, while a class can be reused.",
      "In JavaScript, select the button with document.querySelector(\"#helloButton\").",
      "Inside the click listener, set message.textContent to a new sentence.",
    ],
  },
  {
    id: "kindness-counter",
    title: "Create a kindness counter",
    eyebrow: "Interactive project",
    description: "Build a tiny counter that celebrates helpful actions and keeps its status readable.",
    skills: ["State", "DOM updates", "Accessible status text"],
    files: {
      html: `<main class="counter-card">
  <span class="leaf" aria-hidden="true">🌱</span>
  <h1>Kindness grows</h1>
  <p>Log one helpful action at a time.</p>
  <strong id="count" aria-live="polite">0</strong>
  <button id="addKindness" type="button">I helped someone</button>
</main>`,
      css: `body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(150deg, #edf8f4, #e8f2fb);
  color: #17324d;
  font-family: Arial, sans-serif;
}

.counter-card {
  width: min(100%, 380px);
  padding: 36px 28px;
  border-radius: 32px 16px 30px 18px;
  background: white;
  box-shadow: 0 20px 50px rgba(17, 80, 70, .13);
  text-align: center;
}

.leaf { font-size: 42px; }
#count { display: block; margin: 18px; color: #11876b; font-size: 56px; }
button { padding: 12px 18px; border: 0; border-radius: 999px; background: #11876b; color: white; font-weight: 700; cursor: pointer; }`,
      js: `let total = 0;
const count = document.querySelector("#count");
const addButton = document.querySelector("#addKindness");

addButton.addEventListener("click", () => {
  total += 1;
  count.textContent = total;
});`,
    },
    tests: [
      { id: "count", title: "Display the count", kind: "dom-exists", selector: "#count", failure: "Add an element with id=\"count\"." },
      { id: "button", title: "Include an action button", kind: "dom-exists", selector: "button#addKindness", failure: "Add a button with id=\"addKindness\"." },
      { id: "increment", title: "Increase the count when clicked", kind: "click-number-increases", selector: "#addKindness", target: "#count", failure: "The number in #count should increase after a click." },
      { id: "status", title: "Announce updates to screen readers", kind: "dom-attribute", selector: "#count", attribute: "aria-live", expected: "polite", failure: "Set aria-live=\"polite\" on the count." },
    ],
    hints: [
      "Store the total in a let variable because its value needs to change.",
      "Add one inside the button's click listener with total += 1.",
      "After changing total, copy it into the page with count.textContent = total.",
    ],
  },
  {
    id: "mini-quiz",
    title: "Design a one-question quiz",
    eyebrow: "Challenge project",
    description: "Turn a question and two choices into an instant-feedback learning experience.",
    skills: ["Data attributes", "Event listeners", "Feedback states"],
    files: {
      html: `<main class="quiz-card">
  <p class="topic">Digital literacy check</p>
  <h1>Which password is stronger?</h1>
  <div class="choices">
    <button type="button" data-correct="false">password123</button>
    <button type="button" data-correct="true">River!Cloud7-Lamp</button>
  </div>
  <p id="feedback" aria-live="polite">Choose an answer.</p>
</main>`,
      css: `body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; background: #eef5ff; color: #14395b; font-family: Arial, sans-serif; }
.quiz-card { width: min(100%, 520px); padding: 32px; border-radius: 26px 14px 30px 16px; background: white; box-shadow: 0 18px 48px rgba(20, 57, 91, .14); }
.topic { color: #1769aa; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.choices { display: grid; gap: 12px; margin: 24px 0; }
button { padding: 14px; border: 2px solid #d8e4ee; border-radius: 12px; background: white; color: #14395b; cursor: pointer; text-align: left; }
button:hover { border-color: #1769aa; }
#feedback { min-height: 24px; font-weight: 700; }`,
      js: `const choices = document.querySelectorAll("[data-correct]");
const feedback = document.querySelector("#feedback");

choices.forEach((choice) => {
  choice.addEventListener("click", () => {
    const isCorrect = choice.dataset.correct === "true";
    feedback.textContent = isCorrect
      ? "Correct — length and variety make it stronger."
      : "Try again. Look for length and a mix of characters.";
  });
});`,
    },
    tests: [
      { id: "choices", title: "Offer at least two choices", kind: "dom-count", selector: "[data-correct]", minimum: 2, failure: "Add at least two elements with a data-correct attribute." },
      { id: "answer", title: "Mark one correct answer", kind: "dom-exists", selector: "[data-correct='true']", failure: "Mark the correct choice with data-correct=\"true\"." },
      { id: "feedback", title: "Show a feedback region", kind: "dom-attribute", selector: "#feedback", attribute: "aria-live", expected: "polite", failure: "Create #feedback and give it aria-live=\"polite\"." },
      { id: "respond", title: "Respond when the correct answer is clicked", kind: "click-changes-text", selector: "[data-correct='true']", target: "#feedback", failure: "Update #feedback inside the choice click listener." },
    ],
    hints: [
      "Use document.querySelectorAll to collect every choice, then loop with forEach.",
      "A data-correct attribute is available in JavaScript as choice.dataset.correct.",
      "Set feedback.textContent inside the click listener so the learner sees the result.",
    ],
  },
];

export const CURRICULUM_WEB_PROJECTS = [
  {
    id: "community-site",
    title: "Build a trustworthy community site",
    eyebrow: "Week 5 · web studio",
    description: "Create a clear, responsive program page whose main action works for keyboard and phone users.",
    skills: ["Semantic structure", "Responsive CSS", "Accessible interaction"],
    files: {
      html: `<main>
  <nav aria-label="Program navigation"><a href="#program">Program</a><a href="#schedule">Schedule</a><a href="#contact">Contact</a></nav>
  <section class="hero" id="program">
    <p class="eyebrow">Free community workshop</p>
    <h1>Build digital skills you can use this week.</h1>
    <p>Small-group practice, shared-device activities, and a project you can show.</p>
    <button id="interestButton" type="button">I am interested</button>
    <p id="interestStatus" aria-live="polite">Registration opens Monday.</p>
  </section>
  <section id="schedule"><h2>What to expect</h2><ul><li>Saturday, 10:00</li><li>Bring curiosity; devices are shared</li></ul></section>
  <footer id="contact">Questions? <a href="mailto:hello@example.org">Email the program</a>.</footer>
</main>`,
      css: `* { box-sizing: border-box; }
body { margin: 0; background: #edf5f8; color: #17394b; font: 17px/1.65 Arial, sans-serif; }
main { width: min(100% - 32px, 900px); margin: 28px auto; }
nav { display: flex; flex-wrap: wrap; gap: 18px; padding: 14px 0; }
a { color: #135f8b; font-weight: 700; }
.hero { padding: clamp(30px, 7vw, 72px); border-radius: 34px 14px 42px 20px; background: white; box-shadow: 0 18px 45px rgba(23,57,75,.12); }
h1 { max-width: 680px; font-size: clamp(2.2rem, 8vw, 4.8rem); line-height: 1.02; }
button { min-height: 48px; padding: 12px 20px; border: 0; border-radius: 999px; background: #176f95; color: white; font-weight: 800; }
section:not(.hero), footer { padding: 28px 10px; }
@media (max-width: 520px) { main { width: min(100% - 20px, 900px); } nav { gap: 12px; } .hero { padding: 28px 20px; } }`,
      js: `const button = document.querySelector("#interestButton");
const status = document.querySelector("#interestStatus");
button.addEventListener("click", () => {
  status.textContent = "Thanks — we will show the registration link here on Monday.";
});`,
    },
    tests: [
      { id: "main", title: "Use a semantic main landmark", kind: "dom-exists", selector: "main", failure: "Wrap the primary content in <main>." },
      { id: "nav", title: "Offer three clear navigation choices", kind: "dom-count", selector: "nav a", minimum: 3, failure: "Add at least three descriptive links inside nav." },
      { id: "responsive", title: "Include a narrow-screen layout rule", kind: "source-regex", file: "css", pattern: "@media\\s*\\(", flags: "i", failure: "Add an @media rule for a narrow viewport." },
      { id: "cta", title: "Make the primary action respond", kind: "click-changes-text", selector: "#interestButton", target: "#interestStatus", failure: "Update #interestStatus when #interestButton is activated." },
    ],
    hints: ["Start with meaningful landmarks and heading order before styling.", "Use fluid width and clamp() so the page adapts instead of merely shrinking.", "Connect the real button to visible aria-live feedback in JavaScript."],
  },
  {
    id: "user-first-landing",
    title: "Redesign a confusing sign-up screen",
    eyebrow: "Week 2 · user experience",
    description: "Make the purpose, eligibility, privacy promise, and next action understandable without pressure or hidden choices.",
    skills: ["Mental models", "Ethical hierarchy", "Form clarity"],
    files: {
      html: `<main class="signup-card">
  <p class="eyebrow">Saturday learning lab</p><h1>Reserve a free seat</h1>
  <p id="requirements">For learners ages 14–18. We use your email only for workshop updates.</p>
  <label for="email">Email address</label><input id="email" type="email" autocomplete="email" aria-describedby="requirements">
  <button id="continueButton" type="button" aria-describedby="requirements">Review my request</button>
  <p id="formStatus" aria-live="polite">Nothing is submitted until you review.</p>
</main>`,
      css: `body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 20px; background: #e9f3f7; color: #183d50; font: 17px/1.55 Arial,sans-serif; }
.signup-card { width: min(100%, 520px); padding: clamp(26px,7vw,52px); border-radius: 32px 14px 38px 18px; background: white; box-shadow: 0 20px 55px rgba(20,55,75,.13); }
label { display: block; margin-top: 24px; font-weight: 800; } input { width: 100%; min-height: 48px; margin: 6px 0 16px; padding: 10px; border: 2px solid #7695a5; border-radius: 10px; }
button { min-height: 48px; border: 0; border-radius: 999px; padding: 12px 20px; background: #176f95; color: white; font-weight: 800; }
button:focus-visible, input:focus-visible { outline: 4px solid #e6ae36; outline-offset: 3px; }`,
      js: `const email = document.querySelector("#email");
const status = document.querySelector("#formStatus");
document.querySelector("#continueButton").addEventListener("click", () => {
  status.textContent = email.validity.valid && email.value ? "Ready to review — your request has not been sent yet." : "Enter a valid email to continue.";
});`,
    },
    tests: [
      { id: "purpose", title: "State one clear page purpose", kind: "dom-count", selector: "h1", minimum: 1, failure: "Add one descriptive h1." },
      { id: "label", title: "Label the email field", kind: "dom-exists", selector: "label[for='email']", failure: "Connect a visible label to #email." },
      { id: "privacy", title: "Connect relevant guidance", kind: "dom-attribute", selector: "#email", attribute: "aria-describedby", expected: "requirements", failure: "Use aria-describedby to connect the requirements and privacy text." },
      { id: "feedback", title: "Give honest action feedback", kind: "click-changes-text", selector: "#continueButton", target: "#formStatus", failure: "Update #formStatus without pretending the request was submitted." },
    ],
    hints: ["Put eligibility and privacy information before the action.", "Use a visible label; placeholder text is not a label.", "Feedback should describe exactly what did and did not happen."],
  },
  {
    id: "portfolio-site",
    title: "Build an evidence-first portfolio",
    eyebrow: "Week 6 · portfolio studio",
    description: "Turn two projects into readable case studies and create a responsive, safe contact path.",
    skills: ["Case studies", "Responsive layout", "Professional evidence"],
    files: {
      html: `<main><header><p class="eyebrow">Amina Diallo · student developer</p><h1>I build clear tools for community learning.</h1><p>Responsive web projects with careful research and accessible interaction.</p></header>
  <section aria-labelledby="work"><h2 id="work">Selected work</h2><div class="project-grid">
    <article class="project-card"><h3>Workshop finder</h3><p><strong>Problem:</strong> opportunities were scattered across chats.</p><p><strong>Contribution:</strong> I designed and built a phone-first searchable list.</p></article>
    <article class="project-card"><h3>Shared-device quiz</h3><p><strong>Problem:</strong> groups needed immediate practice feedback.</p><p><strong>Contribution:</strong> I added keyboard controls and clear result states.</p></article>
  </div></section>
  <button id="processButton" type="button">How I work</button><p id="processNote" aria-live="polite">Select the button to read my process.</p>
  <footer><a href="mailto:portfolio@example.org">Contact me about a project</a></footer></main>`,
      css: `body { margin: 0; background: #edf5f7; color: #17394a; font: 17px/1.6 Arial,sans-serif; } main { width: min(100% - 32px, 980px); margin: auto; padding: 64px 0; } header { max-width: 760px; } h1 { font-size: clamp(2.4rem,8vw,5rem); line-height: 1; } .project-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; } .project-card { padding: 26px; border-radius: 28px 12px 34px 16px; background: white; box-shadow: 0 14px 35px rgba(20,55,75,.1); } button { min-height:48px; margin:28px 0 4px; border:0; border-radius:999px; padding:12px 18px; background:#176f95; color:white; font-weight:800; } footer { margin-top: 42px; } a { color:#125f88; font-weight:800; } @media (max-width: 640px) { .project-grid { grid-template-columns: 1fr; } main { padding-top: 34px; } }`,
      js: `document.querySelector("#processButton").addEventListener("click", () => { document.querySelector("#processNote").textContent = "I define the user task, prototype the smallest path, test it on a phone, and revise from evidence."; });`,
    },
    tests: [
      { id: "main", title: "Use a main landmark", kind: "dom-exists", selector: "main", failure: "Add a semantic main element." },
      { id: "cases", title: "Include at least two case studies", kind: "dom-count", selector: ".project-card", minimum: 2, failure: "Create at least two .project-card articles." },
      { id: "responsive", title: "Stack projects on narrow screens", kind: "source-regex", file: "css", pattern: "@media[\\s\\S]*project-grid", flags: "i", failure: "Add a narrow-screen rule for .project-grid." },
      { id: "process", title: "Explain your process interactively", kind: "click-changes-text", selector: "#processButton", target: "#processNote", failure: "Update #processNote when the process button is selected." },
    ],
    hints: ["Each project needs problem, your contribution, and evidence—not only a screenshot.", "Use a one-column media query before cards become cramped.", "Make the contact route specific and safe for public display."],
  },
  {
    id: "workflow-simulator",
    title: "Simulate a registration workflow",
    eyebrow: "Automation · systems studio",
    description: "Map form data into a visible queue, provide a confirmation, and keep a human fallback for exceptions.",
    skills: ["Data mapping", "Event handling", "Operational feedback"],
    files: {
      html: `<main><h1>Workshop registration simulator</h1><p>Nothing leaves this preview. Test with made-up data.</p>
  <label>Name <input id="learnerName" value="Test Learner"></label><label>Email <input id="learnerEmail" type="email" value="test@example.org"></label>
  <button id="routeButton" type="button">Route registration</button><p id="workflowStatus" aria-live="polite">Waiting for a sample.</p>
  <table><caption>Automation queue</caption><thead><tr><th>Name</th><th>Email</th><th>Next action</th></tr></thead><tbody id="workflowRows"></tbody></table>
  <p><strong>Manual fallback:</strong> facilitator reviews any row marked “needs attention.”</p></main>`,
      css: `body { margin:0; padding:24px; background:#ecf4f7; color:#17394a; font:16px/1.55 Arial,sans-serif; } main { width:min(100%,760px); margin:auto; padding:32px; border-radius:30px 14px 36px 18px; background:white; } label { display:grid; gap:5px; margin:14px 0; font-weight:800; } input { min-height:44px; padding:8px; } button { min-height:48px; padding:10px 16px; border:0; border-radius:999px; background:#176f95; color:white; font-weight:800; } table { width:100%; margin-top:24px; border-collapse:collapse; } th,td { padding:10px; border-bottom:1px solid #ccdbe1; text-align:left; } @media(max-width:520px){ main{padding:22px 16px;} table{font-size:.82rem;} }`,
      js: `const rows = document.querySelector("#workflowRows");
const status = document.querySelector("#workflowStatus");
document.querySelector("#routeButton").addEventListener("click", () => {
  const name = document.querySelector("#learnerName").value.trim();
  const email = document.querySelector("#learnerEmail").value.trim();
  const valid = name && email.includes("@");
  rows.replaceChildren();
  const row = document.createElement("tr");
  [name || "Missing", email || "Missing", valid ? "Send confirmation" : "Needs attention"].forEach((value) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
  });
  rows.appendChild(row);
  status.textContent = valid ? "Mapped 2 fields; confirmation is ready." : "Stopped for human review: a required field is invalid.";
});`,
    },
    tests: [
      { id: "status", title: "Route a safe sample", kind: "click-changes-text", selector: "#routeButton", target: "#workflowStatus", failure: "Handle #routeButton and update #workflowStatus." },
      { id: "row", title: "Create a mapped queue row", kind: "dom-exists", selector: "#workflowRows tr", failure: "Map the sample into a row inside #workflowRows." },
      { id: "live", title: "Announce workflow results", kind: "dom-attribute", selector: "#workflowStatus", attribute: "aria-live", expected: "polite", failure: "Set aria-live=polite on the status." },
      { id: "fallback", title: "Keep a human fallback", kind: "source-regex", file: "html", pattern: "Manual fallback", flags: "i", failure: "Document a manual fallback for exceptions." },
    ],
    hints: ["Read and trim the two input values inside the button handler.", "Validate required fields before choosing the next action.", "Write both a visible queue row and an aria-live status so results are inspectable."],
  },
];

export const ALL_WEB_CODE_PROJECTS = [...WEB_CODE_PROJECTS, ...CURRICULUM_WEB_PROJECTS];
export const PYTHON_PROJECTS = [
  {
    id: "python-opportunity",
    language: "python",
    title: "Build an opportunity recommender",
    eyebrow: "Python · decision project",
    description: "Complete a real Python function, run it in your browser, and prove every boundary behaves as intended.",
    skills: ["Functions", "Types", "Conditionals", "Boundary tests"],
    starter: `def recommend(hours_studied, projects_completed):
    # TODO: return "Check your inputs" when either value is negative.
    # TODO: return "Ready to apply" for 8+ hours and 2+ projects.
    # TODO: return "Build one more project" for 5+ hours or 1+ project.
    return "Keep learning"

print(recommend(8, 2))`,
    tests: [
      { id: "function", title: "Define the recommend function", kind: "source-regex", pattern: "def\\s+recommend\\s*\\(", flags: "i", failure: "Define a function named recommend with two parameters." },
      { id: "ready", title: "Recognize an application-ready learner", kind: "python-call-equals", expression: "recommend(8, 2)", expected: "Ready to apply", failure: "recommend(8, 2) should return Ready to apply." },
      { id: "project", title: "Give a focused next step", kind: "python-call-equals", expression: "recommend(5, 1)", expected: "Build one more project", failure: "recommend(5, 1) should return Build one more project." },
      { id: "boundary", title: "Handle the lower boundary", kind: "python-call-equals", expression: "recommend(0, 0)", expected: "Keep learning", failure: "recommend(0, 0) should return Keep learning." },
      { id: "invalid", title: "Reject impossible negative input", kind: "python-call-equals", expression: "recommend(-1, 2)", expected: "Check your inputs", failure: "Negative input should return Check your inputs before any other branch." },
    ],
    hints: [
      "Check negative values first with `if hours_studied < 0 or projects_completed < 0:`.",
      "Put the most specific success rule before the broader practice rule.",
      "Use `and` when both success conditions must be true; use `or` when either practice condition is enough.",
    ],
  },
];

export const CODE_PROJECTS = [...ALL_WEB_CODE_PROJECTS, ...PYTHON_PROJECTS, ...LESSON_PYTHON_PROJECTS];
export const DEFAULT_CODE_PROJECT_ID = ALL_WEB_CODE_PROJECTS[0].id;

export function getCodeProject(projectId) {
  return CODE_PROJECTS.find((project) => project.id === projectId) || CODE_PROJECTS[0];
}
