---
slug: "python-03-apis"
title: "APIs & External Libraries"
track: "Intermediate Python"
trackSlug: "intermediate-python"
week: 3
level: "Intermediate"
duration: 75
sourceUrl: "https://docs.google.com/presentation/d/1fb6nc1MjDrGqxh8UoVNYZMlO1d43ZhyD/edit"
summary: "Understand request-response communication, use HTTP methods and status codes, parse JSON, and handle timeouts or errors when Python depends on an external service."
summarySw: "Elewa mawasiliano ya ombi na jibu, tumia mbinu za HTTP na status codes, soma JSON na shughulikia muda kuisha au makosa Python inapoutegemea huduma ya nje."
summaryFr: "Comprenez les échanges requête-réponse, utilisez les méthodes HTTP et codes d’état, analysez le JSON et gérez les délais ou erreurs des services externes."
activity: "Read a saved sample API response offline, validate the fields you need, and display one useful result. Then sketch how the program should respond to 404, 429, and 500 errors."
objectives: ["Explain API in your own words.","Apply HTTP status code to a realistic classroom or community example.","Connect API with Resilient request when making a decision.","Complete the practice task and reflect on one improvement."]
keyIdeas: [{"term":"API","definition":"A defined interface that lets software systems exchange requests, actions, and data without exposing every internal implementation detail."},{"term":"HTTP status code","definition":"A numeric response that communicates whether a request succeeded, failed because of the client, or failed on the server."},{"term":"Resilient request","definition":"A network call with a timeout, status checking, validated data, and a useful fallback or error message."}]
flashcards: [{"front":"API","back":"A defined interface that lets software systems exchange requests, actions, and data without exposing every internal implementation detail."},{"front":"HTTP status code","back":"A numeric response that communicates whether a request succeeded, failed because of the client, or failed on the server."},{"front":"Resilient request","back":"A network call with a timeout, status checking, validated data, and a useful fallback or error message."},{"front":"Why this lesson matters","back":"Understand request-response communication, use HTTP methods and status codes, parse JSON, and handle timeouts or errors when Python depends on an external service."},{"front":"Practice challenge","back":"Read a saved sample API response offline, validate the fields you need, and display one useful result. Then sketch how the program should respond to 404, 429, and 500 errors."},{"front":"Teach it back","back":"Explain API, show how HTTP status code is used, and describe why Resilient request changes the result."}]
quiz: [{"question":"Which explanation best describes API?","choices":["A defined interface that lets software systems exchange requests, actions, and data without exposing every internal implementation detail.","A numeric response that communicates whether a request succeeded, failed because of the client, or failed on the server.","A network call with a timeout, status checking, validated data, and a useful fallback or error message.","A decorative feature with no effect on the task"],"answer":0,"explanation":"A defined interface that lets software systems exchange requests, actions, and data without exposing every internal implementation detail."},{"question":"Which explanation best describes HTTP status code?","choices":["A defined interface that lets software systems exchange requests, actions, and data without exposing every internal implementation detail.","A network call with a timeout, status checking, validated data, and a useful fallback or error message.","A decorative feature with no effect on the task","A numeric response that communicates whether a request succeeded, failed because of the client, or failed on the server."],"answer":3,"explanation":"A numeric response that communicates whether a request succeeded, failed because of the client, or failed on the server."},{"question":"Which explanation best describes Resilient request?","choices":["A numeric response that communicates whether a request succeeded, failed because of the client, or failed on the server.","A decorative feature with no effect on the task","A network call with a timeout, status checking, validated data, and a useful fallback or error message.","A defined interface that lets software systems exchange requests, actions, and data without exposing every internal implementation detail."],"answer":2,"explanation":"A network call with a timeout, status checking, validated data, and a useful fallback or error message."},{"question":"Which action best applies HTTP status code in this lesson?","choices":["Read a saved sample API response offline, validate the fields you need, and display one useful result. Then sketch how the program should respond to 404, 429, and 500 errors.","Skip the goal and begin clicking until something changes.","Copy another learner’s result without explaining the steps.","Memorize the term but avoid using it in a realistic task."],"answer":0,"explanation":"The guided practice applies HTTP status code through a concrete task: Read a saved sample API response offline, validate the fields you need, and display one useful result. Then sketch how the program should respond to 404, 429, and 500 errors."},{"question":"How do API and Resilient request work together?","choices":["They are unrelated terms that should be studied separately.","Resilient request replaces the need to understand API.","API gives you a foundation, while Resilient request helps you make a safer or more effective decision during the task.","They only matter when every learner has a separate computer."],"answer":2,"explanation":"Connecting API with Resilient request turns a definition into a decision you can explain and check."},{"question":"What is the strongest evidence that you understood this lesson?","choices":["Reading the title once and moving on.","Completing the practice, comparing the result with your prediction, and explaining one improvement.","Finishing before everyone else without checking the result.","Remembering one word but not being able to use it."],"answer":1,"explanation":"Real understanding combines action, checking, explanation, and reflection—not speed or memorization alone."}]
translationStatus: "Draft — native speaker review required"
---

## Why this lesson matters

Understand request-response communication, use HTTP methods and status codes, parse JSON, and handle timeouts or errors when Python depends on an external service.

The goal is not to memorize vocabulary. By the end of the lesson, you should be able to use the ideas in a realistic situation, explain the reason for your choices, and check whether the result actually works for the intended person or task.

## Learning objectives

- Explain API in your own words.
- Apply HTTP status code to a realistic classroom or community example.
- Connect API with Resilient request when making a decision.
- Complete the practice task and reflect on one improvement.

## Core ideas

### 1. API

A defined interface that lets software systems exchange requests, actions, and data without exposing every internal implementation detail.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how API changes what you choose, create, or check.

### 2. HTTP status code

A numeric response that communicates whether a request succeeded, failed because of the client, or failed on the server.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how HTTP status code changes what you choose, create, or check.

### 3. Resilient request

A network call with a timeout, status checking, validated data, and a useful fallback or error message.

**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how Resilient request changes what you choose, create, or check.

## How the ideas connect

Start with **API** to understand the foundation of the lesson. Use **HTTP status code** to turn that understanding into an action. Then apply **Resilient request** to check the quality, safety, or usefulness of the result. The three ideas are strongest when you can explain their relationship rather than treating them as separate definitions.

## Guided walkthrough

1. **Name the goal.** In one sentence, write what you are trying to understand, create, or improve.
2. **Make a prediction.** Before touching a device, use API and HTTP status code to predict what a strong result should look like.
3. **Complete the task.** Read a saved sample API response offline, validate the fields you need, and display one useful result. Then sketch how the program should respond to 404, 429, and 500 errors.
4. **Check the outcome.** Use Resilient request to inspect the result. Ask what worked, what did not, and what evidence supports your judgment.
5. **Explain and revise.** Tell a partner what you changed and why. Make one small improvement, then compare the new result with the first one.

## Worked classroom scenario

Imagine two learners sharing one device. The first learner is the **driver** and performs the steps; the second is the **navigator** and reads the goal, predicts the next step, and checks the result. Halfway through the task, switch roles. Both learners should be able to explain how API, HTTP status code, and Resilient request appeared in the work.

If no device is available, complete the same reasoning on paper: sketch the screen or result, label each decision, and describe what you would test when a device becomes available.

## Common mistakes and fixes

- **Rushing into the tool:** Write the goal and prediction first so every click or step has a reason.
- **Copying without understanding:** After each major step, explain it in your own words to a partner.
- **Accepting the first result:** Compare the outcome with the goal and make at least one deliberate improvement.
- **Letting one person control a shared device:** Rotate driver and navigator roles so both learners think and practice.

## Independent practice

Read a saved sample API response offline, validate the fields you need, and display one useful result. Then sketch how the program should respond to 404, 429, and 500 errors.

For an extra challenge, adapt the task for a different audience or community need. Write two sentences explaining what changed and which lesson idea guided your decision.

## Check your understanding

1. How would you explain API to someone new to the topic?
2. What is one realistic example of HTTP status code outside this classroom?
3. When might Resilient request prevent a weak, unsafe, or confusing result?
4. How are API and HTTP status code connected?
5. What evidence would convince you that your practice result works?
6. If you repeated the activity tomorrow, what would you improve first and why?

## Key takeaway

Understand request-response communication, use HTTP methods and status codes, parse JSON, and handle timeouts or errors when Python depends on an external service.

You are ready to move on when you can explain the three core ideas, complete the practice without copying, and describe one improvement using evidence from your result.
