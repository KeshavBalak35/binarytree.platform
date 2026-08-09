export const TREE_PATH_TIERS = [
  { id: 0, name: "Roots", subtitle: "Absolute survival skills", description: "Keyboard, Windows, files, safety, and trustworthy research." },
  { id: 1, name: "Trunk", subtitle: "Office productivity core", description: "Google Workspace and Microsoft Office, learned side by side." },
  { id: 2, name: "Branches", subtitle: "Choose and connect foundations", description: "Design, data, coding, and personal-brand foundations." },
  { id: 3, name: "Canopy", subtitle: "Intermediate builder", description: "Cross-branch work that combines tools, code, design, and evidence." },
  { id: 4, name: "Crown", subtitle: "Expert outcomes", description: "Machine learning, advanced brand systems, and one integrated capstone." },
];

export const TREE_PATH_NODES = [
  { id: "0.1", tier: 0, branch: "foundation", title: "Keyboard Mastery", summary: "Typing, essential shortcuts, window switching, and a measurable 40-WPM goal.", prerequisites: [], lessonSlugs: [], toolHref: "/typing" },
  { id: "0.2", tier: 0, branch: "foundation", title: "How to Use Windows", summary: "Navigate a computer confidently: windows, settings, files, updates, and everyday troubleshooting.", prerequisites: ["0.1"], lessonSlugs: ["senegal-01-computer-skills"] },
  { id: "0.2b", tier: 0, branch: "foundation", title: "File Management & Cloud Hygiene", summary: "Organize, name, back up, and recover files before working in the cloud.", prerequisites: ["0.2"], lessonSlugs: ["digital-03-files"] },
  { id: "0.3", tier: 0, branch: "foundation", title: "Digital Literacy & Password Protection", summary: "Phishing, 2FA, password managers, cookies, safer browsing, and backups.", prerequisites: ["0.1", "0.2b"], lessonSlugs: ["digital-01-orientation", "senegal-08-cybersecurity", "professional-02-social-media-safety"] },
  { id: "0.4", tier: 0, branch: "foundation", title: "Critical Thinking & Internet Research", summary: "Search deliberately, compare sources, and verify claims before using or sharing them.", prerequisites: ["0.3"], lessonSlugs: ["digital-02-web-research"] },

  { id: "1.1", tier: 1, branch: "foundation", title: "Google Workspace Basics", summary: "Gmail, Calendar, Drive structure, sharing, permissions, and search.", prerequisites: ["0.3"], lessonSlugs: ["professional-03-google-workspace"] },
  { id: "1.2", tier: 1, branch: "foundation", title: "Microsoft Office Basics", summary: "Understand Word, Excel, PowerPoint, Outlook, OneDrive, and how they compare with Google tools.", prerequisites: ["0.3"], lessonSlugs: ["data-01-office-data-toolkit"] },
  { id: "1.3", tier: 1, branch: "foundation", title: "Docs & Word Intermediate", summary: "Styles, structure, professional writing, collaboration, and review workflows.", prerequisites: ["1.1", "1.2"], lessonSlugs: ["professional-01-resumes-and-email", "brand-02-workspace-productivity"] },
  { id: "1.4", tier: 1, branch: "foundation", title: "Sheets & Excel Beginner", summary: "Formulas, sorting, filters, lookup thinking, and clean tabular data.", prerequisites: ["1.3"], lessonSlugs: ["data-01-office-data-toolkit"] },
  { id: "1.5", tier: 1, branch: "foundation", title: "Slides & PowerPoint Beginner", summary: "Layouts, visual hierarchy, master slides, and clear presenting.", prerequisites: ["1.3"], lessonSlugs: ["professional-03-google-workspace", "design-01-layout-hierarchy"] },
  { id: "1.6", tier: 1, branch: "foundation", title: "Advanced Shortcuts & Power-User Moves", summary: "Keyboard-driven workflows, clipboard history, text expansion, and faster window management.", prerequisites: ["1.4", "1.5"], lessonSlugs: ["brand-02-workspace-productivity"] },
  { id: "1.7", tier: 1, branch: "foundation", title: "Workspace & Office Advanced", summary: "Automation, macros, structured workflows, dashboards, and repeatable operations.", prerequisites: ["1.6"], lessonSlugs: ["professional-04-workflow-automation", "senegal-09-task-automation", "brand-03-no-code-automation"] },

  { id: "2.1", tier: 2, branch: "design", title: "Graphic Design Fundamentals", summary: "Composition, typography, hierarchy, grids, file types, and visual critique.", prerequisites: ["1.7"], lessonSlugs: ["design-01-layout-hierarchy"] },
  { id: "2.2", tier: 2, branch: "design", title: "Color Theory & Accessibility", summary: "Palettes, HEX/RGB, contrast, meaning, and accessible color decisions.", prerequisites: ["2.1"], lessonSlugs: ["senegal-05-canva-design"] },
  { id: "2.3", tier: 2, branch: "design", title: "Design Tools Beginner", summary: "Build practical assets with Canva and transfer the same design reasoning to other tools.", prerequisites: ["2.2"], lessonSlugs: ["senegal-05-canva-design", "senegal-06-personal-portfolio"] },
  { id: "2.4", tier: 2, branch: "data", title: "SQL & Data Thinking Beginner", summary: "Think in rows, fields, filters, and relationships before writing more advanced programs.", prerequisites: ["1.7"], lessonSlugs: ["data-01-office-data-toolkit", "digital-04-python-fundamentals"] },
  { id: "2.5", tier: 2, branch: "data", title: "SQL & Reusable Data Logic", summary: "Group, compare, combine, and reuse data operations through structured problem solving.", prerequisites: ["2.4"], lessonSlugs: ["digital-05-lists-functions"] },
  { id: "2.6", tier: 2, branch: "data", title: "Computational Thinking", summary: "Break problems into steps, trace logic, write pseudocode, and test assumptions.", prerequisites: ["2.4"], lessonSlugs: ["digital-04-python-fundamentals"] },
  { id: "2.7", tier: 2, branch: "data", title: "Python Programming Beginner", summary: "Variables, conditions, loops, functions, collections, and useful small automations.", prerequisites: ["2.5", "2.6"], lessonSlugs: ["professional-06-python-introduction", "professional-07-python-data-structures", "brand-05-python-basics", "brand-06-python-collections"] },
  { id: "2.8", tier: 2, branch: "brand", title: "Personal Brand & Social Media Basics", summary: "Define a useful niche, write a clear bio, audit a profile, and network safely.", prerequisites: ["1.7", "2.1"], lessonSlugs: ["senegal-03-social-media-presence", "brand-01-networking-safely"] },
  { id: "2.9", tier: 2, branch: "brand", title: "Content Basics", summary: "Plan useful posts, write captions, reuse templates, and build a consistent presence.", prerequisites: ["2.3", "2.8"], lessonSlugs: ["senegal-03-social-media-presence", "senegal-05-canva-design"] },

  { id: "3.0", tier: 3, branch: "data", title: "Statistics for Data Science", summary: "Mean, median, distributions, variation, sampling, and evidence for model decisions.", prerequisites: ["2.5"], lessonSlugs: ["ml-01-eda"] },
  { id: "3.1", tier: 3, branch: "design", title: "Graphic Design Advanced", summary: "Advanced layout systems, brand kits, portfolio presentation, and repeatable visual rules.", prerequisites: ["2.2", "2.3"], lessonSlugs: ["senegal-06-personal-portfolio", "brand-04-web-credibility"] },
  { id: "3.2", tier: 3, branch: "data", title: "Office Expert & Advanced Data", summary: "Data cleaning, analysis workflows, reporting, automation, and dashboard thinking.", prerequisites: ["1.7", "2.5"], lessonSlugs: ["data-01-office-data-toolkit", "professional-04-workflow-automation"] },
  { id: "3.3", tier: 3, branch: "data", title: "Python Intermediate", summary: "Files, APIs, libraries, data processing, plotting concepts, and reliable program structure.", prerequisites: ["2.5", "2.7"], lessonSlugs: ["python-01-fundamentals-review", "python-02-files-and-data", "python-03-apis"] },
  { id: "3.4", tier: 3, branch: "data", title: "Version Control with Git", summary: "Track changes, explain commits, collaborate safely, and recover previous work.", prerequisites: ["3.3"], lessonSlugs: ["professional-05-good-websites"] },
  { id: "3.5", tier: 3, branch: "data", title: "Python Advanced", summary: "Object-oriented design, reusable automation, and maintainable project architecture.", prerequisites: ["3.3", "3.4"], lessonSlugs: ["python-04-oop"] },
  { id: "3.6", tier: 3, branch: "brand", title: "Personal Brand Intermediate", summary: "Credibility, analytics, discoverability, SEO thinking, and evidence-backed positioning.", prerequisites: ["2.9", "3.1"], lessonSlugs: ["brand-04-web-credibility", "senegal-06-personal-portfolio"] },
  { id: "3.7", tier: 3, branch: "design", title: "Data Storytelling", summary: "Combine charts, visual hierarchy, color, and narrative so evidence is understandable.", prerequisites: ["2.2", "3.2"], lessonSlugs: ["ml-01-eda", "design-01-layout-hierarchy"] },
  { id: "3.8", tier: 3, branch: "brand", title: "Ethics, Copyright & Privacy", summary: "Copyright, AI ethics, consent, responsible data use, and safe public work.", prerequisites: ["2.8", "0.4"], lessonSlugs: ["senegal-07-copyright", "brand-07-responsible-ai", "professional-08-ai-everyday-life", "senegal-04-ai-concepts"] },

  { id: "4.1", tier: 4, branch: "data", title: "Machine Learning Beginner", summary: "EDA, train/test splits, regression, classification, and careful evaluation.", prerequisites: ["3.0", "3.2", "3.3"], lessonSlugs: ["ml-01-eda", "ml-02-linear-regression", "ml-04-logistic-regression"] },
  { id: "4.2", tier: 4, branch: "data", title: "Machine Learning Advanced", summary: "Feature complexity, tuning, overfitting, neural-network training, and model comparison.", prerequisites: ["4.1"], lessonSlugs: ["ml-03-polynomial-tuning", "ml-05-neural-networks", "ml-06-tuning-neural-networks"] },
  { id: "4.3", tier: 4, branch: "data", title: "Machine Learning Expert & AI Tools", summary: "Combine advanced models, responsible AI, deployment thinking, and useful automation.", prerequisites: ["4.2", "3.5"], lessonSlugs: ["ml-05-neural-networks", "ml-06-tuning-neural-networks", "professional-08-ai-everyday-life", "brand-07-responsible-ai"] },
  { id: "4.4", tier: 4, branch: "brand", title: "Personal Brand Advanced", summary: "Create a sustainable content system, prove value, protect your work, and operate professionally.", prerequisites: ["3.6", "3.7", "3.8"], lessonSlugs: ["senegal-06-personal-portfolio", "senegal-07-copyright", "brand-04-web-credibility"] },
  { id: "4.5", tier: 4, branch: "crown", title: "Final Integrated Capstone", summary: "Plan, build, analyze, explain, and publish one project that demonstrates the whole TreePath.", prerequisites: ["4.1", "4.2", "4.3", "4.4"], lessonSlugs: ["python-05-capstone"] },
];

export function treeNodeForLesson(slug) {
  return TREE_PATH_NODES.find((node) => node.lessonSlugs.includes(slug)) || null;
}
