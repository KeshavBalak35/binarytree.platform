const MISSION_MANIFEST = {
  "brand-01-networking-safely": { title: "Build a safe professional presence plan", kind: "plan", format: "Profile and outreach plan", deliverable: "A public/private content map, one evidence-based profile improvement, and a respectful networking message." },
  "brand-02-workspace-productivity": { title: "Create a shared-workspace handoff kit", kind: "create", format: "Productivity system", deliverable: "A folder map, naming rule, permission decision, shared-document plan, and concise handoff email." },
  "brand-03-no-code-automation": { title: "Build an automation decision blueprint", kind: "code", format: "Interactive workflow", deliverable: "A working trigger-to-action simulation with mapped data, a failure path, and human review.", codeProjectId: "workflow-simulator" },
  "brand-04-web-credibility": { title: "Build a credibility-first portfolio page", kind: "code", format: "Responsive website", deliverable: "A phone-ready page with clear purpose, useful evidence, predictable navigation, and a working action.", codeProjectId: "community-site" },
  "brand-05-python-basics": { title: "Code a budget-warning calculator", kind: "code", format: "Python program", deliverable: "A checked Python function that calculates product totals, compares a budget, and rejects invalid input.", codeProjectId: "python-budget" },
  "brand-06-python-collections": { title: "Code a portfolio project index", kind: "code", format: "Python program", deliverable: "A list of project dictionaries formatted into a readable portfolio index.", codeProjectId: "python-portfolio-index" },
  "brand-07-responsible-ai": { title: "Produce a human-reviewed AI biography", kind: "analyze", format: "AI review record", deliverable: "A safe professional bio with every claim checked, revisions explained, and private information removed." },
  "data-01-office-data-toolkit": { title: "Create a data-to-decision mini report", kind: "create", format: "Data report", deliverable: "A clean table, one supported finding, a short written explanation, and a one-slide presentation." },
  "design-01-layout-hierarchy": { title: "Redesign a poster for five-second clarity", kind: "create", format: "Visual design", deliverable: "A revised poster using a grid, focal point, aligned edges, purposeful contrast, and tested reading order." },
  "digital-01-orientation": { title: "Build your digital learning map", kind: "plan", format: "Learning plan", deliverable: "A current strength, one concrete digital goal, an ordered first step, and a fair shared-device routine." },
  "digital-02-web-research": { title: "Write a two-source credibility brief", kind: "analyze", format: "Research brief", deliverable: "Two independently checked sources with author, date, evidence, bias notes, citations, and a reasoned comparison." },
  "digital-03-files": { title: "Create a clean file-system handoff", kind: "create", format: "File organization", deliverable: "A folder hierarchy, repeatable naming convention, format decisions, compression choice, and recovery explanation." },
  "digital-04-python-fundamentals": { title: "Code a three-guess number game", kind: "code", format: "Python program", deliverable: "A checked comparison function that reports equal, too high, or too low and handles invalid input.", codeProjectId: "python-guessing-game" },
  "digital-05-lists-functions": { title: "Code a reusable score analyzer", kind: "code", format: "Python program", deliverable: "A checked function that averages a list, preserves reusable logic, and handles an empty list safely.", codeProjectId: "python-score-average" },
  "ml-01-eda": { title: "Produce a dataset-readiness report", kind: "analyze", format: "EDA notebook", deliverable: "A variable inventory, quality audit, suitable chart plan, two safe questions, and two claims the sample cannot support." },
  "ml-02-linear-regression": { title: "Build a regression evidence sheet", kind: "analyze", format: "Model worksheet", deliverable: "A candidate line, slope interpretation, residual calculations, train/test boundary, and evidence-based conclusion." },
  "ml-03-polynomial-tuning": { title: "Write a model-selection memo", kind: "analyze", format: "Model comparison", deliverable: "A comparison of three curves using training and test MSE, with underfitting and overfitting diagnosed." },
  "ml-04-logistic-regression": { title: "Design a threshold-and-harm analysis", kind: "analyze", format: "Classification decision", deliverable: "A threshold choice tied to false-positive and false-negative costs, plus metrics that reveal the tradeoff." },
  "ml-05-neural-networks": { title: "Draw and explain a prediction network", kind: "create", format: "Model diagram", deliverable: "A labeled network with inputs, weights, bias, neuron, output, and a clear explanation of what training changes." },
  "ml-06-tuning-neural-networks": { title: "Create an overfitting diagnosis log", kind: "analyze", format: "Training review", deliverable: "An epoch-by-epoch loss reading, the likely overfitting point, and one justified tuning experiment." },
  "professional-01-resumes-and-email": { title: "Create a targeted application package", kind: "create", format: "Career communication", deliverable: "A quantified resume bullet and five-sentence professional email tailored to one real opportunity." },
  "professional-02-social-media-safety": { title: "Complete a safe profile audit", kind: "analyze", format: "Professional profile review", deliverable: "A trust-and-privacy audit with one evidence improvement, one safety correction, and one networking action." },
  "professional-03-google-workspace": { title: "Build a shared project workspace", kind: "create", format: "Collaboration system", deliverable: "Three purposeful folders, named files, tested permissions, a current document, and a clear collaborator handoff." },
  "professional-04-workflow-automation": { title: "Simulate a classroom registration workflow", kind: "code", format: "Interactive workflow", deliverable: "A working registration queue with mapped fields, visible confirmation, validation, and a human fallback.", codeProjectId: "workflow-simulator" },
  "professional-05-good-websites": { title: "Build a trustworthy community website", kind: "code", format: "Responsive website", deliverable: "A semantic, responsive page with predictable navigation, clear proof, a working action, and phone support.", codeProjectId: "community-site" },
  "professional-06-python-introduction": { title: "Code a learner score checker", kind: "code", format: "Python program", deliverable: "A checked Python function that personalizes a next step from a learner name and validated score.", codeProjectId: "python-score-checker" },
  "professional-07-python-data-structures": { title: "Code a shop inventory tracker", kind: "code", format: "Python program", deliverable: "A checked list-of-dictionaries inventory that updates quantities and reports low-stock products.", codeProjectId: "python-inventory" },
  "professional-08-ai-everyday-life": { title: "Run a verified prompt experiment", kind: "analyze", format: "AI comparison", deliverable: "A vague and improved prompt, a side-by-side output comparison, two verified claims, and a human revision record." },
  "python-01-fundamentals-review": { title: "Refactor a messy learner record", kind: "code", format: "Python refactor", deliverable: "A checked function with readable names, explicit type conversion, validation, and focused responsibilities.", codeProjectId: "python-refactor" },
  "python-02-files-and-data": { title: "Code a CSV-to-JSON category summary", kind: "code", format: "Python data tool", deliverable: "A checked data-processing function with category counts, a predictable summary, and missing-data handling.", codeProjectId: "python-data-summary" },
  "python-03-apis": { title: "Code a resilient API response reader", kind: "code", format: "Python API tool", deliverable: "A checked response parser that validates fields and produces useful outcomes for success, missing data, and errors.", codeProjectId: "python-api-reader" },
  "python-04-oop": { title: "Code a course-progress class", kind: "code", format: "Python OOP project", deliverable: "A checked Course class with independent state, completion behavior, validation, and a progress method.", codeProjectId: "python-course-class" },
  "python-05-capstone": { title: "Build a console item-lister capstone", kind: "code", format: "Python capstone", deliverable: "A checked Item class and summary functions designed for validation, persistence, commands, and later charting.", codeProjectId: "python-item-lister" },
  "senegal-01-computer-skills": { title: "Demonstrate a complete computer system", kind: "practice", format: "Hands-on demonstration", deliverable: "A labeled input-process-storage-output map plus a safe startup, use, and shutdown demonstration." },
  "senegal-02-understanding-users": { title: "Redesign a confusing sign-up screen", kind: "code", format: "Interactive interface", deliverable: "A clearer screen with visible purpose, eligibility, privacy guidance, accessible labels, and honest feedback.", codeProjectId: "user-first-landing" },
  "senegal-03-social-media-presence": { title: "Create a professional social launch pack", kind: "create", format: "Content package", deliverable: "A purpose statement, three supported skills, one proof-of-work post, a safe call to action, and review notes." },
  "senegal-04-ai-concepts": { title: "Complete a prompt-and-verification experiment", kind: "analyze", format: "AI learning record", deliverable: "Two prompt versions, an annotated comparison, one independently verified claim, and a responsible-use decision." },
  "senegal-05-canva-design": { title: "Design a community event poster", kind: "create", format: "Visual campaign asset", deliverable: "A one-page poster with one headline, three details, one action, a limited palette, and a five-second test result." },
  "senegal-06-personal-portfolio": { title: "Build an evidence-first portfolio", kind: "code", format: "Responsive portfolio", deliverable: "A responsive portfolio with About, Skills, two project case studies, process evidence, and a safe contact path.", codeProjectId: "portfolio-site" },
  "senegal-07-copyright": { title: "Create a licensed-asset register", kind: "analyze", format: "Rights and sources record", deliverable: "A decision for four assets, their creator and source, license terms, required attribution, and replacement plan." },
  "senegal-08-cybersecurity": { title: "Write a phishing-response playbook", kind: "analyze", format: "Safety procedure", deliverable: "An evidence-marked review of three messages plus a verification, containment, recovery, and reporting sequence." },
  "senegal-09-task-automation": { title: "Build a small-team automation map", kind: "code", format: "Interactive workflow", deliverable: "A working trigger-action simulation with field mapping, exception handling, ownership, and human approval.", codeProjectId: "workflow-simulator" },
};

export const LESSON_MISSION_COUNT = Object.keys(MISSION_MANIFEST).length;

export function buildLessonMission(lesson) {
  const spec = MISSION_MANIFEST[lesson.slug] || {
    title: `Apply ${lesson.title}`,
    kind: "practice",
    format: "Lesson project",
    deliverable: lesson.activity,
  };
  const ideas = Array.isArray(lesson.keyIdeas) ? lesson.keyIdeas.slice(0, 3) : [];
  const first = ideas[0]?.term || "the lesson goal";
  const second = ideas[1]?.term || "the method";
  const third = ideas[2]?.term || "the quality check";

  return {
    id: `${lesson.slug}-project`,
    lessonSlug: lesson.slug,
    lessonTitle: lesson.title,
    ...spec,
    brief: lesson.activity,
    estimatedMinutes: spec.kind === "code" ? 55 : 35,
    steps: [
      { id: "plan", title: "Plan the work", prompt: `State the goal, audience or user, and the evidence a strong result needs. Explain how ${first} changes your plan.` },
      { id: "make", title: spec.kind === "code" ? "Build and test" : "Create the deliverable", prompt: lesson.activity },
      { id: "prove", title: "Prove and improve", prompt: `Use ${second} and ${third} to check the result. Record one piece of evidence, one correction, and one improvement you would make next.` },
    ],
    criteria: ideas.map((idea) => ({ title: idea.term, description: idea.definition })),
    reflection: `What changed between your first attempt and final result, and which idea from ${lesson.title} caused that change?`,
  };
}

export function hasMissionForLesson(slug) {
  return Boolean(MISSION_MANIFEST[slug]);
}
