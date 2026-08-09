import { spawnSync } from "node:child_process";
import { LESSON_PYTHON_PROJECTS } from "../lib/lesson-code-projects.js";

const failures = [];
const ids = new Set();

for (const project of LESSON_PYTHON_PROJECTS) {
  if (ids.has(project.id)) failures.push(`${project.id}: duplicate project id.`);
  ids.add(project.id);
  if (project.tests.length < 4) failures.push(`${project.id}: fewer than four checks.`);
  for (const test of project.tests) {
    if (test.kind === "source-regex") {
      try { new RegExp(test.pattern, test.flags || ""); } catch (error) { failures.push(`${project.id}/${test.id}: invalid regular expression (${error.message}).`); }
    }
  }
}

const payload = LESSON_PYTHON_PROJECTS.map((project) => ({
  id: project.id,
  starter: project.starter,
  expressions: project.tests.filter((test) => test.expression).map((test) => ({ id: test.id, expression: test.expression })),
}));
const validator = String.raw`
import ast, json, sys
projects = json.loads(sys.stdin.read())
errors = []
for project in projects:
    try:
        ast.parse(project["starter"], filename=project["id"] + ".py")
    except SyntaxError as error:
        errors.append(f'{project["id"]}: starter syntax: {error}')
    for test in project["expressions"]:
        try:
            ast.parse(test["expression"], mode="eval")
        except SyntaxError as error:
            errors.append(f'{project["id"]}/{test["id"]}: expression syntax: {error}')
print("\n".join(errors))
sys.exit(1 if errors else 0)
`;
const result = spawnSync("python", ["-c", validator], { input: JSON.stringify(payload), encoding: "utf8" });
if (result.status !== 0) failures.push(result.stdout.trim() || result.stderr.trim() || "Python syntax verifier failed.");

if (failures.length) {
  console.error(`Python project verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Verified ${LESSON_PYTHON_PROJECTS.length} unique Python lesson projects, ${LESSON_PYTHON_PROJECTS.reduce((total, project) => total + project.tests.length, 0)} checks, all starter programs, and all behavioral-test expressions.`);
