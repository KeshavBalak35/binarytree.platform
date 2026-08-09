import { LessonPlanner } from "@/components/lesson-planner";

export const metadata = {
  title: "Lesson-plan generator",
  description: "Generate a complete 60-minute lesson plan designed for low-resource classrooms, shared computers, and unreliable internet.",
};

export default function LessonPlannerPage() {
  return (
    <main className="planner-page" id="main-content">
      <div className="container"><LessonPlanner /></div>
    </main>
  );
}
