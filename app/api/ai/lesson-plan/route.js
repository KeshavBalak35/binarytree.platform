import { generateAIText, isAIConfigured } from "@/lib/ai-provider";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

function fallbackPlan(topic, grade, resources) {
  return {
    title: `${topic}: a practical 60-minute lesson`,
    overview: `A low-resource lesson for ${grade} that moves from prior knowledge to a shared demonstration, paired practice, and an individual exit check.`,
    objectives: [
      `Explain the central idea of ${topic} in plain language.`,
      `Apply ${topic} to one realistic example.`,
      "Show understanding through a short independent response.",
    ],
    materials: ["Board or large paper", "Pens or pencils", resources || "One shared device per small group (optional)", "Scrap paper for each learner"],
    timeline: [
      { minutes: "0–7", title: "Warm-up", description: `Ask learners where they have already encountered ${topic}. Collect three examples without correcting them yet.` },
      { minutes: "7–17", title: "Mini lesson", description: `Explain the core idea with one familiar local example. Keep devices closed so attention stays on the model and vocabulary.` },
      { minutes: "17–27", title: "Shared demonstration", description: `Model one complete ${topic} task. Think aloud, pause before each step, and ask pairs to predict what comes next.` },
      { minutes: "27–45", title: "Paired practice", description: "Pairs rotate driver and navigator roles. If no devices are available, they complete the same steps on paper and annotate their decisions." },
      { minutes: "45–54", title: "Student exercise", description: `Each learner solves a new ${topic} example independently, then explains one decision to a partner.` },
      { minutes: "54–60", title: "Exit check", description: "Learners answer: What is it? When would you use it? What mistake should you avoid? Collect responses for the next lesson." },
    ],
    exercise: `Create or analyze one small example of ${topic}. Label the important parts, explain your process in three steps, and write one way to check your result.`,
    assessment: "Use a three-point check: correct idea, workable process, and clear explanation. Re-teach any point missed by more than one-third of the group.",
    adaptations: [
      "No internet: use the downloaded lesson notes and paper examples.",
      "Shared computers: use pairs with rotating driver and navigator roles.",
      "No printer: copy the task to the board and let learners answer in notebooks.",
      "Mixed levels: provide a worked example for support and an open-ended extension for early finishers.",
    ],
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const topic = String(body.topic || "").trim().slice(0, 180);
    const grade = String(body.grade || "").trim().slice(0, 80);
    const resources = String(body.resources || "").trim().slice(0, 500);
    if (!topic || !grade) return NextResponse.json({ error: "Topic and grade level are required." }, { status: 400 });

    if (!isAIConfigured()) return NextResponse.json({ plan: fallbackPlan(topic, grade, resources), offline: true });

    const prompt = `You are an expert Binary Tree curriculum designer. Create a complete, practical 60-minute lesson plan about "${topic}" for ${grade}.

NON-NEGOTIABLE CONTEXT:
- The classroom is low-resource and may have no internet.
- Computers may be shared by two to four learners.
- The teacher may have no printer or projector.
- Materials explicitly available: ${resources || "board, paper, pencils, and possibly shared computers"}.
- Every activity must be realistic in that setting.

Return ONLY valid JSON with exactly these keys:
{
  "title": "string",
  "overview": "string",
  "objectives": ["three measurable objectives"],
  "materials": ["short material list"],
  "timeline": [{"minutes":"0–8","title":"Warm-up","description":"specific instructions"}],
  "exercise": "individual student exercise",
  "assessment": "how the teacher checks learning",
  "adaptations": ["no internet", "shared computers", "no printer", "mixed levels"]
}
The timeline must total exactly 60 minutes and include a warm-up, explicit teaching, demonstration, collaborative practice, an individual exercise, and wrap-up. Keep language concrete and teacher-ready.`;

    const generation = await generateAIText(prompt, { json: true, temperature: 0.1 });
    const text = generation.text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("invalid response");
    const plan = JSON.parse(match[0]);
    if (!Array.isArray(plan.timeline) || !Array.isArray(plan.objectives) || !plan.exercise) throw new Error("incomplete response");
    return NextResponse.json({ plan, offline: false });
  } catch {
    return NextResponse.json({ error: "A lesson plan could not be generated right now." }, { status: 503 });
  }
}
