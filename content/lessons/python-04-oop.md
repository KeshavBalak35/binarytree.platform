---
slug: "python-04-oop"
title: "Object-Oriented Programming"
track: "Intermediate Python"
trackSlug: "intermediate-python"
week: 4
level: "Intermediate"
duration: 75
sourceUrl: "https://docs.google.com/presentation/d/1QMDGCQQ6Za5MyI2rD2BCM-LcuosjqSen/edit"
summary: "Model related data and behavior with classes and objects, initialize unique state through constructors, and use encapsulation, inheritance, and polymorphism intentionally."
summarySw: "Wakilisha data na tabia zinazohusiana kwa classes na objects, anzisha hali ya kila object kwa constructor na tumia encapsulation, inheritance na polymorphism kwa kusudi."
summaryFr: "Modélisez données et comportements avec classes et objets, initialisez l’état par des constructeurs et utilisez encapsulation, héritage et polymorphisme avec intention."
activity: "Design a Course class with title, learner count, and completed lessons. Add methods to record completion and calculate progress, then create two independent course objects."
objectives: ["Explain Class in your own words.","Apply Object to a realistic classroom or community example.","Connect Class with Encapsulation when making a decision.","Complete the practice task and reflect on one improvement."]
keyIdeas: [{"term":"Class","definition":"A blueprint that defines the attributes and methods shared by objects of the same conceptual type."},{"term":"Object","definition":"A concrete instance of a class with its own state while using the behavior defined by the class."},{"term":"Encapsulation","definition":"Keeping related data and operations together behind a clear interface so internal details can change without breaking callers."}]
flashcards: [{"front":"Class","back":"A blueprint that defines the attributes and methods shared by objects of the same conceptual type."},{"front":"Object","back":"A concrete instance of a class with its own state while using the behavior defined by the class."},{"front":"Encapsulation","back":"Keeping related data and operations together behind a clear interface so internal details can change without breaking callers."},{"front":"Why this lesson matters","back":"Model related data and behavior with classes and objects, initialize unique state through constructors, and use encapsulation, inheritance, and polymorphism intentionally."},{"front":"Practice challenge","back":"Design a Course class with title, learner count, and completed lessons. Add methods to record completion and calculate progress, then create two independent course objects."},{"front":"Teach it back","back":"Explain Class, show how Object is used, and describe why Encapsulation changes the result."}]
quiz: [{"question":"Which explanation best describes Class?","choices":["A blueprint that defines the attributes and methods shared by objects of the same conceptual type.","A concrete instance of a class with its own state while using the behavior defined by the class.","Keeping related data and operations together behind a clear interface so internal details can change without breaking callers.","A decorative feature with no effect on the task"],"answer":0,"explanation":"A blueprint that defines the attributes and methods shared by objects of the same conceptual type."},{"question":"Which explanation best describes Object?","choices":["A blueprint that defines the attributes and methods shared by objects of the same conceptual type.","Keeping related data and operations together behind a clear interface so internal details can change without breaking callers.","A decorative feature with no effect on the task","A concrete instance of a class with its own state while using the behavior defined by the class."],"answer":3,"explanation":"A concrete instance of a class with its own state while using the behavior defined by the class."},{"question":"Which explanation best describes Encapsulation?","choices":["A concrete instance of a class with its own state while using the behavior defined by the class.","A decorative feature with no effect on the task","Keeping related data and operations together behind a clear interface so internal details can change without breaking callers.","A blueprint that defines the attributes and methods shared by objects of the same conceptual type."],"answer":2,"explanation":"Keeping related data and operations together behind a clear interface so internal details can change without breaking callers."},{"question":"Which action best applies Object in this lesson?","choices":["Design a Course class with title, learner count, and completed lessons. Add methods to record completion and calculate progress, then create two independent course objects.","Skip the goal and begin clicking until something changes.","Copy another learner’s result without explaining the steps.","Memorize the term but avoid using it in a realistic task."],"answer":0,"explanation":"The guided practice applies Object through a concrete task: Design a Course class with title, learner count, and completed lessons. Add methods to record completion and calculate progress, then create two independent course objects."},{"question":"How do Class and Encapsulation work together?","choices":["They are unrelated terms that should be studied separately.","Encapsulation replaces the need to understand Class.","Class gives you a foundation, while Encapsulation helps you make a safer or more effective decision during the task.","They only matter when every learner has a separate computer."],"answer":2,"explanation":"Connecting Class with Encapsulation turns a definition into a decision you can explain and check."},{"question":"What is the strongest evidence that you understood this lesson?","choices":["Reading the title once and moving on.","Completing the practice, comparing the result with your prediction, and explaining one improvement.","Finishing before everyone else without checking the result.","Remembering one word but not being able to use it."],"answer":1,"explanation":"Real understanding combines action, checking, explanation, and reflection—not speed or memorization alone."}]
translationStatus: "Draft — native speaker review required"
---

## Why this lesson matters

Model related data and behavior with classes and objects, initialize unique state through constructors, and use encapsulation, inheritance, and polymorphism intentionally.

The goal is not to memorize vocabulary. By the end of the lesson, you should be able to use the ideas in a realistic situation, explain the reason for your choices, and check whether the result actually works for the intended person or task.

## Learning objectives

- Explain Class in your own words.
- Apply Object to a realistic classroom or community example.
- Connect Class with Encapsulation when making a decision.
- Complete the practice task and reflect on one improvement.

## Core ideas

### 1. Class

A blueprint that defines the attributes and methods shared by objects of the same conceptual type.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how Class changes what you choose, create, or check.

### 2. Object

A concrete instance of a class with its own state while using the behavior defined by the class.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how Object changes what you choose, create, or check.

### 3. Encapsulation

Keeping related data and operations together behind a clear interface so internal details can change without breaking callers.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how Encapsulation changes what you choose, create, or check.

## How the ideas connect

Start with **Class** to understand the foundation of the lesson. Use **Object** to turn that understanding into an action. Then apply **Encapsulation** to check the quality, safety, or usefulness of the result. The three ideas are strongest when you can explain their relationship rather than treating them as separate definitions.

## Guided walkthrough

1. **Name the goal.** In one sentence, write what you are trying to understand, create, or improve.
2. **Make a prediction.** Before touching a device, use Class and Object to predict what a strong result should look like.
3. **Complete the task.** Design a Course class with title, learner count, and completed lessons. Add methods to record completion and calculate progress, then create two independent course objects.
4. **Check the outcome.** Use Encapsulation to inspect the result. Ask what worked, what did not, and what evidence supports your judgment.
5. **Explain and revise.** Tell a partner what you changed and why. Make one small improvement, then compare the new result with the first one.

## Worked classroom scenario

Imagine two learners sharing one device. The first learner is the **driver** and performs the steps; the second is the **navigator** and reads the goal, predicts the next step, and checks the result. Halfway through the task, switch roles. Both learners should be able to explain how Class, Object, and Encapsulation appeared in the work.

If no device is available, complete the same reasoning on paper: sketch the screen or result, label each decision, and describe what you would test when a device becomes available.

## Common mistakes and fixes

- **Rushing into the tool:** Write the goal and prediction first so every click or step has a reason.
- **Copying without understanding:** After each major step, explain it in your own words to a partner.
- **Accepting the first result:** Compare the outcome with the goal and make at least one deliberate improvement.
- **Letting one person control a shared device:** Rotate driver and navigator roles so both learners think and practice.

## Independent practice

Design a Course class with title, learner count, and completed lessons. Add methods to record completion and calculate progress, then create two independent course objects.

For an extra challenge, adapt the task for a different audience or community need. Write two sentences explaining what changed and which lesson idea guided your decision.

## Check your understanding

1. How would you explain Class to someone new to the topic?
2. What is one realistic example of Object outside this classroom?
3. When might Encapsulation prevent a weak, unsafe, or confusing result?
4. How are Class and Object connected?
5. What evidence would convince you that your practice result works?
6. If you repeated the activity tomorrow, what would you improve first and why?

## Key takeaway

Model related data and behavior with classes and objects, initialize unique state through constructors, and use encapsulation, inheritance, and polymorphism intentionally.

You are ready to move on when you can explain the three core ideas, complete the practice without copying, and describe one improvement using evidence from your result.
