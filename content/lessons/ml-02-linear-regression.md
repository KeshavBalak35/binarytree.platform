---
slug: "ml-02-linear-regression"
title: "Linear Regression & Train/Test Split"
track: "Machine Learning with Python"
trackSlug: "machine-learning"
week: 2
level: "Intermediate"
duration: 90
sourceUrl: "https://docs.google.com/presentation/d/1HU3pJG4LVZZWZ1HrltSaUjVmnQESSEHp/edit"
summary: "Fit and interpret a linear model, explain slope and intercept in context, inspect residual error, and use held-out test data to estimate performance on new examples."
summarySw: "Jenga na ufasiri modeli ya mstari, eleza mteremko na sehemu ya kukata katika muktadha, chunguza mabaki ya makosa na tumia data ya majaribio kupima mifano mipya."
summaryFr: "Ajustez et interprétez un modèle linéaire, expliquez pente et intercept dans le contexte, examinez les résidus et utilisez des données de test pour estimer la performance future."
activity: "Use a simple attendance and score table. Draw a candidate line, interpret its slope, calculate two residuals, and explain why the test set must not be used to fit the model."
objectives: ["Explain Linear regression in your own words.","Apply Residual to a realistic classroom or community example.","Connect Linear regression with Train/test split when making a decision.","Complete the practice task and reflect on one improvement."]
keyIdeas: [{"term":"Linear regression","definition":"A model that predicts a quantitative outcome with a weighted linear relationship between one or more features and the target."},{"term":"Residual","definition":"The difference between an observed outcome and the model’s prediction for that observation."},{"term":"Train/test split","definition":"Separating data so one portion fits the model and an untouched portion estimates how well it generalizes to unseen examples."}]
flashcards: [{"front":"Linear regression","back":"A model that predicts a quantitative outcome with a weighted linear relationship between one or more features and the target."},{"front":"Residual","back":"The difference between an observed outcome and the model’s prediction for that observation."},{"front":"Train/test split","back":"Separating data so one portion fits the model and an untouched portion estimates how well it generalizes to unseen examples."},{"front":"Why this lesson matters","back":"Fit and interpret a linear model, explain slope and intercept in context, inspect residual error, and use held-out test data to estimate performance on new examples."},{"front":"Practice challenge","back":"Use a simple attendance and score table. Draw a candidate line, interpret its slope, calculate two residuals, and explain why the test set must not be used to fit the model."},{"front":"Teach it back","back":"Explain Linear regression, show how Residual is used, and describe why Train/test split changes the result."}]
quiz: [{"question":"Which explanation best describes Linear regression?","choices":["A model that predicts a quantitative outcome with a weighted linear relationship between one or more features and the target.","The difference between an observed outcome and the model’s prediction for that observation.","Separating data so one portion fits the model and an untouched portion estimates how well it generalizes to unseen examples.","A decorative feature with no effect on the task"],"answer":0,"explanation":"A model that predicts a quantitative outcome with a weighted linear relationship between one or more features and the target."},{"question":"Which explanation best describes Residual?","choices":["A model that predicts a quantitative outcome with a weighted linear relationship between one or more features and the target.","Separating data so one portion fits the model and an untouched portion estimates how well it generalizes to unseen examples.","A decorative feature with no effect on the task","The difference between an observed outcome and the model’s prediction for that observation."],"answer":3,"explanation":"The difference between an observed outcome and the model’s prediction for that observation."},{"question":"Which explanation best describes Train/test split?","choices":["The difference between an observed outcome and the model’s prediction for that observation.","A decorative feature with no effect on the task","Separating data so one portion fits the model and an untouched portion estimates how well it generalizes to unseen examples.","A model that predicts a quantitative outcome with a weighted linear relationship between one or more features and the target."],"answer":2,"explanation":"Separating data so one portion fits the model and an untouched portion estimates how well it generalizes to unseen examples."},{"question":"Which action best applies Residual in this lesson?","choices":["Use a simple attendance and score table. Draw a candidate line, interpret its slope, calculate two residuals, and explain why the test set must not be used to fit the model.","Skip the goal and begin clicking until something changes.","Copy another learner’s result without explaining the steps.","Memorize the term but avoid using it in a realistic task."],"answer":0,"explanation":"The guided practice applies Residual through a concrete task: Use a simple attendance and score table. Draw a candidate line, interpret its slope, calculate two residuals, and explain why the test set must not be used to fit the model."},{"question":"How do Linear regression and Train/test split work together?","choices":["They are unrelated terms that should be studied separately.","Train/test split replaces the need to understand Linear regression.","Linear regression gives you a foundation, while Train/test split helps you make a safer or more effective decision during the task.","They only matter when every learner has a separate computer."],"answer":2,"explanation":"Connecting Linear regression with Train/test split turns a definition into a decision you can explain and check."},{"question":"What is the strongest evidence that you understood this lesson?","choices":["Reading the title once and moving on.","Completing the practice, comparing the result with your prediction, and explaining one improvement.","Finishing before everyone else without checking the result.","Remembering one word but not being able to use it."],"answer":1,"explanation":"Real understanding combines action, checking, explanation, and reflection—not speed or memorization alone."}]
translationStatus: "Draft — native speaker review required"
---

## Why this lesson matters

Fit and interpret a linear model, explain slope and intercept in context, inspect residual error, and use held-out test data to estimate performance on new examples.

The goal is not to memorize vocabulary. By the end of the lesson, you should be able to use the ideas in a realistic situation, explain the reason for your choices, and check whether the result actually works for the intended person or task.

## Learning objectives

- Explain Linear regression in your own words.
- Apply Residual to a realistic classroom or community example.
- Connect Linear regression with Train/test split when making a decision.
- Complete the practice task and reflect on one improvement.

## Core ideas

### 1. Linear regression

A model that predicts a quantitative outcome with a weighted linear relationship between one or more features and the target.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how Linear regression changes what you choose, create, or check.

### 2. Residual

The difference between an observed outcome and the model’s prediction for that observation.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how Residual changes what you choose, create, or check.

### 3. Train/test split

Separating data so one portion fits the model and an untouched portion estimates how well it generalizes to unseen examples.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how Train/test split changes what you choose, create, or check.

## How the ideas connect

Start with **Linear regression** to understand the foundation of the lesson. Use **Residual** to turn that understanding into an action. Then apply **Train/test split** to check the quality, safety, or usefulness of the result. The three ideas are strongest when you can explain their relationship rather than treating them as separate definitions.

## Guided walkthrough

1. **Name the goal.** In one sentence, write what you are trying to understand, create, or improve.
2. **Make a prediction.** Before touching a device, use Linear regression and Residual to predict what a strong result should look like.
3. **Complete the task.** Use a simple attendance and score table. Draw a candidate line, interpret its slope, calculate two residuals, and explain why the test set must not be used to fit the model.
4. **Check the outcome.** Use Train/test split to inspect the result. Ask what worked, what did not, and what evidence supports your judgment.
5. **Explain and revise.** Tell a partner what you changed and why. Make one small improvement, then compare the new result with the first one.

## Worked classroom scenario

Imagine two learners sharing one device. The first learner is the **driver** and performs the steps; the second is the **navigator** and reads the goal, predicts the next step, and checks the result. Halfway through the task, switch roles. Both learners should be able to explain how Linear regression, Residual, and Train/test split appeared in the work.

If no device is available, complete the same reasoning on paper: sketch the screen or result, label each decision, and describe what you would test when a device becomes available.

## Common mistakes and fixes

- **Rushing into the tool:** Write the goal and prediction first so every click or step has a reason.
- **Copying without understanding:** After each major step, explain it in your own words to a partner.
- **Accepting the first result:** Compare the outcome with the goal and make at least one deliberate improvement.
- **Letting one person control a shared device:** Rotate driver and navigator roles so both learners think and practice.

## Independent practice

Use a simple attendance and score table. Draw a candidate line, interpret its slope, calculate two residuals, and explain why the test set must not be used to fit the model.

For an extra challenge, adapt the task for a different audience or community need. Write two sentences explaining what changed and which lesson idea guided your decision.

## Check your understanding

1. How would you explain Linear regression to someone new to the topic?
2. What is one realistic example of Residual outside this classroom?
3. When might Train/test split prevent a weak, unsafe, or confusing result?
4. How are Linear regression and Residual connected?
5. What evidence would convince you that your practice result works?
6. If you repeated the activity tomorrow, what would you improve first and why?

## Key takeaway

Fit and interpret a linear model, explain slope and intercept in context, inspect residual error, and use held-out test data to estimate performance on new examples.

You are ready to move on when you can explain the three core ideas, complete the practice without copying, and describe one improvement using evidence from your result.
