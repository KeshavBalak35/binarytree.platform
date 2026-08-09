---
slug: "ml-04-logistic-regression"
title: "Logistic Regression & Classification"
track: "Machine Learning with Python"
trackSlug: "machine-learning"
week: 4
level: "Intermediate"
duration: 90
sourceUrl: "https://docs.google.com/presentation/d/1YaW0jZc2HYC67dw_NSL9UnBvXn-_3JlN/edit"
summary: "Move from predicting numbers to classifying outcomes with logistic regression, probability thresholds, confusion-aware evaluation, and a real public-health example."
summarySw: "Hama kutoka kutabiri namba kwenda kuainisha matokeo kwa logistic regression, viwango vya uwezekano, tathmini ya makosa ya aina tofauti na mfano wa afya ya umma."
summaryFr: "Passez de la prédiction numérique à la classification avec la régression logistique, des seuils de probabilité, une évaluation attentive aux erreurs et un cas de santé publique."
activity: "For a safety classification, list the cost of a false positive and false negative. Choose a probability threshold and explain why accuracy alone may hide the most harmful errors."
objectives: ["Explain Classification in your own words.","Apply Probability threshold to a realistic classroom or community example.","Connect Classification with False negative when making a decision.","Complete the practice task and reflect on one improvement."]
keyIdeas: [{"term":"Classification","definition":"A prediction task where the target is a category, such as safe or unsafe, rather than a continuous numeric value."},{"term":"Probability threshold","definition":"The cutoff used to convert a predicted probability into a class label; changing it trades one kind of error for another."},{"term":"False negative","definition":"A case that truly belongs to the positive class but the model incorrectly labels as negative, often important in high-stakes screening."}]
flashcards: [{"front":"Classification","back":"A prediction task where the target is a category, such as safe or unsafe, rather than a continuous numeric value."},{"front":"Probability threshold","back":"The cutoff used to convert a predicted probability into a class label; changing it trades one kind of error for another."},{"front":"False negative","back":"A case that truly belongs to the positive class but the model incorrectly labels as negative, often important in high-stakes screening."},{"front":"Why this lesson matters","back":"Move from predicting numbers to classifying outcomes with logistic regression, probability thresholds, confusion-aware evaluation, and a real public-health example."},{"front":"Practice challenge","back":"For a safety classification, list the cost of a false positive and false negative. Choose a probability threshold and explain why accuracy alone may hide the most harmful errors."},{"front":"Teach it back","back":"Explain Classification, show how Probability threshold is used, and describe why False negative changes the result."}]
quiz: [{"question":"Which explanation best describes Classification?","choices":["A prediction task where the target is a category, such as safe or unsafe, rather than a continuous numeric value.","The cutoff used to convert a predicted probability into a class label; changing it trades one kind of error for another.","A case that truly belongs to the positive class but the model incorrectly labels as negative, often important in high-stakes screening.","A decorative feature with no effect on the task"],"answer":0,"explanation":"A prediction task where the target is a category, such as safe or unsafe, rather than a continuous numeric value."},{"question":"Which explanation best describes Probability threshold?","choices":["A prediction task where the target is a category, such as safe or unsafe, rather than a continuous numeric value.","A case that truly belongs to the positive class but the model incorrectly labels as negative, often important in high-stakes screening.","A decorative feature with no effect on the task","The cutoff used to convert a predicted probability into a class label; changing it trades one kind of error for another."],"answer":3,"explanation":"The cutoff used to convert a predicted probability into a class label; changing it trades one kind of error for another."},{"question":"Which explanation best describes False negative?","choices":["The cutoff used to convert a predicted probability into a class label; changing it trades one kind of error for another.","A decorative feature with no effect on the task","A case that truly belongs to the positive class but the model incorrectly labels as negative, often important in high-stakes screening.","A prediction task where the target is a category, such as safe or unsafe, rather than a continuous numeric value."],"answer":2,"explanation":"A case that truly belongs to the positive class but the model incorrectly labels as negative, often important in high-stakes screening."},{"question":"Which action best applies Probability threshold in this lesson?","choices":["For a safety classification, list the cost of a false positive and false negative. Choose a probability threshold and explain why accuracy alone may hide the most harmful errors.","Skip the goal and begin clicking until something changes.","Copy another learner’s result without explaining the steps.","Memorize the term but avoid using it in a realistic task."],"answer":0,"explanation":"The guided practice applies Probability threshold through a concrete task: For a safety classification, list the cost of a false positive and false negative. Choose a probability threshold and explain why accuracy alone may hide the most harmful errors."},{"question":"How do Classification and False negative work together?","choices":["They are unrelated terms that should be studied separately.","False negative replaces the need to understand Classification.","Classification gives you a foundation, while False negative helps you make a safer or more effective decision during the task.","They only matter when every learner has a separate computer."],"answer":2,"explanation":"Connecting Classification with False negative turns a definition into a decision you can explain and check."},{"question":"What is the strongest evidence that you understood this lesson?","choices":["Reading the title once and moving on.","Completing the practice, comparing the result with your prediction, and explaining one improvement.","Finishing before everyone else without checking the result.","Remembering one word but not being able to use it."],"answer":1,"explanation":"Real understanding combines action, checking, explanation, and reflection—not speed or memorization alone."}]
translationStatus: "Draft — native speaker review required"
---

## Why this lesson matters

Move from predicting numbers to classifying outcomes with logistic regression, probability thresholds, confusion-aware evaluation, and a real public-health example.

The goal is not to memorize vocabulary. By the end of the lesson, you should be able to use the ideas in a realistic situation, explain the reason for your choices, and check whether the result actually works for the intended person or task.

## Learning objectives

- Explain Classification in your own words.
- Apply Probability threshold to a realistic classroom or community example.
- Connect Classification with False negative when making a decision.
- Complete the practice task and reflect on one improvement.

## Core ideas

### 1. Classification

A prediction task where the target is a category, such as safe or unsafe, rather than a continuous numeric value.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how Classification changes what you choose, create, or check.

### 2. Probability threshold

The cutoff used to convert a predicted probability into a class label; changing it trades one kind of error for another.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how Probability threshold changes what you choose, create, or check.

### 3. False negative

A case that truly belongs to the positive class but the model incorrectly labels as negative, often important in high-stakes screening.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how False negative changes what you choose, create, or check.

## How the ideas connect

Start with **Classification** to understand the foundation of the lesson. Use **Probability threshold** to turn that understanding into an action. Then apply **False negative** to check the quality, safety, or usefulness of the result. The three ideas are strongest when you can explain their relationship rather than treating them as separate definitions.

## Guided walkthrough

1. **Name the goal.** In one sentence, write what you are trying to understand, create, or improve.
2. **Make a prediction.** Before touching a device, use Classification and Probability threshold to predict what a strong result should look like.
3. **Complete the task.** For a safety classification, list the cost of a false positive and false negative. Choose a probability threshold and explain why accuracy alone may hide the most harmful errors.
4. **Check the outcome.** Use False negative to inspect the result. Ask what worked, what did not, and what evidence supports your judgment.
5. **Explain and revise.** Tell a partner what you changed and why. Make one small improvement, then compare the new result with the first one.

## Worked classroom scenario

Imagine two learners sharing one device. The first learner is the **driver** and performs the steps; the second is the **navigator** and reads the goal, predicts the next step, and checks the result. Halfway through the task, switch roles. Both learners should be able to explain how Classification, Probability threshold, and False negative appeared in the work.

If no device is available, complete the same reasoning on paper: sketch the screen or result, label each decision, and describe what you would test when a device becomes available.

## Common mistakes and fixes

- **Rushing into the tool:** Write the goal and prediction first so every click or step has a reason.
- **Copying without understanding:** After each major step, explain it in your own words to a partner.
- **Accepting the first result:** Compare the outcome with the goal and make at least one deliberate improvement.
- **Letting one person control a shared device:** Rotate driver and navigator roles so both learners think and practice.

## Independent practice

For a safety classification, list the cost of a false positive and false negative. Choose a probability threshold and explain why accuracy alone may hide the most harmful errors.

For an extra challenge, adapt the task for a different audience or community need. Write two sentences explaining what changed and which lesson idea guided your decision.

## Check your understanding

1. How would you explain Classification to someone new to the topic?
2. What is one realistic example of Probability threshold outside this classroom?
3. When might False negative prevent a weak, unsafe, or confusing result?
4. How are Classification and Probability threshold connected?
5. What evidence would convince you that your practice result works?
6. If you repeated the activity tomorrow, what would you improve first and why?

## Key takeaway

Move from predicting numbers to classifying outcomes with logistic regression, probability thresholds, confusion-aware evaluation, and a real public-health example.

You are ready to move on when you can explain the three core ideas, complete the practice without copying, and describe one improvement using evidence from your result.
