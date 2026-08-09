export const LESSON_PYTHON_PROJECTS = [
  {
    id: "python-budget",
    language: "python",
    title: "Budget-warning calculator",
    eyebrow: "Python basics · lesson project",
    description: "Calculate product totals, compare them with a budget, and make invalid input impossible to mistake for a real result.",
    skills: ["Variables", "Numeric types", "Conditionals", "Input validation"],
    starter: `def budget_status(cost, quantity, budget):
    # Return "Check inputs" when any value is negative.
    # Otherwise return "TOTAL | Within budget" or "TOTAL | Over budget".
    total = cost * quantity
    return f"{total:.2f} | TODO"

print(budget_status(12.50, 2, 30))`,
    tests: [
      { id: "function", title: "Define one reusable budget function", kind: "source-regex", pattern: "def\\s+budget_status\\s*\\(", flags: "i", failure: "Define budget_status(cost, quantity, budget)." },
      { id: "within", title: "Recognize a total inside the budget", kind: "python-call-equals", expression: "budget_status(12.5, 2, 30)", expected: "25.00 | Within budget", failure: "12.50 × 2 with a budget of 30 should be within budget." },
      { id: "over", title: "Warn when the total exceeds the budget", kind: "python-call-equals", expression: "budget_status(10, 4, 35)", expected: "40.00 | Over budget", failure: "A total of 40 with a budget of 35 should be over budget." },
      { id: "boundary", title: "Treat an equal total as within budget", kind: "python-call-equals", expression: "budget_status(5, 4, 20)", expected: "20.00 | Within budget", failure: "Use <= so a total equal to the budget is allowed." },
      { id: "invalid", title: "Reject impossible negative input", kind: "python-call-equals", expression: "budget_status(-1, 2, 10)", expected: "Check inputs", failure: "Check negative values before calculating a result." },
    ],
    hints: ["Validate cost, quantity, and budget before multiplying.", "Use total <= budget for the within-budget branch.", "Format money with f\"{total:.2f}\"."],
  },
  {
    id: "python-portfolio-index",
    language: "python",
    title: "Portfolio project index",
    eyebrow: "Python collections · lesson project",
    description: "Turn project dictionaries into a consistent, readable index without losing the meaning of each field.",
    skills: ["Dictionaries", "Lists", "Functions", "String formatting"],
    starter: `def format_project(project):
    # Join the skills and return: YEAR | TITLE | SKILLS | OUTCOME
    return "TODO"

projects = [
    {"title": "Community site", "skills": ["HTML", "CSS"], "year": 2026, "outcome": "20 learners"},
    {"title": "Budget helper", "skills": ["Python"], "year": 2026, "outcome": "3 test cases"},
]

for project in projects:
    print(format_project(project))`,
    tests: [
      { id: "function", title: "Create a formatting function", kind: "source-regex", pattern: "def\\s+format_project\\s*\\(", flags: "i", failure: "Define format_project(project)." },
      { id: "first", title: "Format a complete web project", kind: "python-call-equals", expression: "format_project({'title':'Community site','skills':['HTML','CSS'],'year':2026,'outcome':'20 learners'})", expected: "2026 | Community site | HTML, CSS | 20 learners", failure: "Read the named dictionary fields and join the skills with a comma." },
      { id: "single", title: "Handle a one-skill project", kind: "python-call-equals", expression: "format_project({'title':'Budget helper','skills':['Python'],'year':2026,'outcome':'3 tests'})", expected: "2026 | Budget helper | Python | 3 tests", failure: "The formatter should also work when the skills list contains one item." },
      { id: "data", title: "Use key-based dictionary access", kind: "source-regex", pattern: "project\\s*\\[\\s*['\"]title['\"]\\s*\\]", flags: "i", failure: "Read the title through its dictionary key instead of a position." },
    ],
    hints: ["Use project['title'], project['year'], and project['outcome'].", "Join the skills with ', '.join(project['skills']).", "Build the final line with an f-string."],
  },
  {
    id: "python-guessing-game",
    language: "python",
    title: "Three-guess number game",
    eyebrow: "Programming fundamentals · lesson project",
    description: "Use comparisons and branches to explain whether a guess is equal, too high, or too low.",
    skills: ["Parameters", "Comparisons", "if / elif / else", "Validation"],
    starter: `def compare_guess(target, guess):
    # Return "Check inputs" unless both values are integers.
    # Then return "Correct", "Too high", or "Too low".
    return "TODO"

for guess in [3, 9, 7]:
    print(compare_guess(7, guess))`,
    tests: [
      { id: "function", title: "Define compare_guess", kind: "source-regex", pattern: "def\\s+compare_guess\\s*\\(", flags: "i", failure: "Define compare_guess(target, guess)." },
      { id: "correct", title: "Recognize the target", kind: "python-call-equals", expression: "compare_guess(7, 7)", expected: "Correct", failure: "Return Correct when guess equals target." },
      { id: "high", title: "Recognize a high guess", kind: "python-call-equals", expression: "compare_guess(7, 9)", expected: "Too high", failure: "Compare guess > target." },
      { id: "low", title: "Recognize a low guess", kind: "python-call-equals", expression: "compare_guess(7, 3)", expected: "Too low", failure: "Use the final branch for a valid lower guess." },
      { id: "invalid", title: "Reject non-number input", kind: "python-call-equals", expression: "compare_guess(7, 'seven')", expected: "Check inputs", failure: "Verify both inputs are integers before comparing them." },
    ],
    hints: ["Use isinstance(value, int) for both values.", "Check equality before greater-than.", "The last valid branch can return Too low."],
  },
  {
    id: "python-score-average",
    language: "python",
    title: "Reusable score analyzer",
    eyebrow: "Lists and functions · lesson project",
    description: "Calculate an average from a list while defining honest behavior for an empty or invalid collection.",
    skills: ["Lists", "Functions", "sum and len", "Edge cases"],
    starter: `def average_scores(scores):
    # Return "No scores" for an empty list.
    # Return "Check scores" if any value is outside 0..100.
    return 0

print(average_scores([80, 90, 85]))`,
    tests: [
      { id: "function", title: "Define a reusable average function", kind: "source-regex", pattern: "def\\s+average_scores\\s*\\(", flags: "i", failure: "Define average_scores(scores)." },
      { id: "normal", title: "Average a normal score list", kind: "python-call-equals", expression: "average_scores([80, 90, 85])", expected: 85, failure: "Divide the sum by the number of scores." },
      { id: "second", title: "Reuse the function with new data", kind: "python-call-equals", expression: "average_scores([60, 70])", expected: 65, failure: "Do not hard-code the example values." },
      { id: "empty", title: "Handle an empty list", kind: "python-call-equals", expression: "average_scores([])", expected: "No scores", failure: "Check for an empty list before dividing." },
      { id: "invalid", title: "Reject an impossible score", kind: "python-call-equals", expression: "average_scores([80, 120])", expected: "Check scores", failure: "Verify every score is between 0 and 100." },
    ],
    hints: ["Check if not scores before calculating.", "Use any(score < 0 or score > 100 for score in scores).", "Use sum(scores) / len(scores)."],
  },
  {
    id: "python-score-checker",
    language: "python",
    title: "Learner score checker",
    eyebrow: "Python foundations · lesson project",
    description: "Turn a validated score into a clear, personalized next learning step.",
    skills: ["Strings", "Numbers", "Conditionals", "Boundary decisions"],
    starter: `def next_step(name, score):
    # Validate name and score, then return a personalized next step.
    return f"{name}: TODO"

print(next_step("Amina", 82))`,
    tests: [
      { id: "function", title: "Define next_step", kind: "source-regex", pattern: "def\\s+next_step\\s*\\(", flags: "i", failure: "Define next_step(name, score)." },
      { id: "ready", title: "Recommend the next lesson at 80+", kind: "python-call-equals", expression: "next_step('Amina', 82)", expected: "Amina: Ready for the next lesson", failure: "Scores of 80 or higher should be ready for the next lesson." },
      { id: "practice", title: "Recommend practice at 50–79", kind: "python-call-equals", expression: "next_step('Mo', 65)", expected: "Mo: Practice once more", failure: "Scores from 50 through 79 need one more practice round." },
      { id: "review", title: "Recommend review below 50", kind: "python-call-equals", expression: "next_step('Ali', 40)", expected: "Ali: Review the guide", failure: "Scores below 50 should return a guide review." },
      { id: "invalid", title: "Reject invalid scores", kind: "python-call-equals", expression: "next_step('Amina', 120)", expected: "Check inputs", failure: "A score must stay between 0 and 100." },
    ],
    hints: ["Validate a non-empty name and a score from 0 to 100 first.", "Check the highest threshold before the lower one.", "Use an f-string to include the learner's name."],
  },
  {
    id: "python-inventory",
    language: "python",
    title: "Shop inventory tracker",
    eyebrow: "Python data structures · lesson project",
    description: "Read a list of product dictionaries and report which items need restocking.",
    skills: ["Lists of dictionaries", "Loops", "Filtering", "Readable output"],
    starter: `def low_stock_names(items, threshold=5):
    # Return matching product names in their original order, joined by comma.
    return "TODO"

inventory = [
    {"name": "Rice", "quantity": 3},
    {"name": "Tea", "quantity": 8},
    {"name": "Soap", "quantity": 5},
]
print(low_stock_names(inventory))`,
    tests: [
      { id: "function", title: "Define the inventory filter", kind: "source-regex", pattern: "def\\s+low_stock_names\\s*\\(", flags: "i", failure: "Define low_stock_names(items, threshold=5)." },
      { id: "normal", title: "Find products at or below the threshold", kind: "python-call-equals", expression: "low_stock_names([{'name':'Rice','quantity':3},{'name':'Tea','quantity':8},{'name':'Soap','quantity':5}])", expected: "Rice, Soap", failure: "Include products whose quantity is less than or equal to the threshold." },
      { id: "none", title: "Handle a fully stocked inventory", kind: "python-call-equals", expression: "low_stock_names([{'name':'Tea','quantity':8}])", expected: "None", failure: "Return None when no product is low." },
      { id: "custom", title: "Respect a custom threshold", kind: "python-call-equals", expression: "low_stock_names([{'name':'Tea','quantity':8},{'name':'Beans','quantity':9}], 8)", expected: "Tea", failure: "Use the threshold parameter rather than hard-coding five." },
    ],
    hints: ["Create a list of names whose quantity <= threshold.", "Join matching names with ', '.join(names).", "Return the string None when the names list is empty."],
  },
  {
    id: "python-refactor",
    language: "python",
    title: "Readable learner-record refactor",
    eyebrow: "Python best practices · lesson project",
    description: "Convert messy text input into a validated, predictable record another programmer can maintain.",
    skills: ["Type conversion", "Validation", "Clear functions", "Readable naming"],
    starter: `def normalize_record(name, age_text, active_text):
    # Return NAME|AGE|active or NAME|AGE|inactive.
    # Return "Check record" for empty names, invalid ages, or unknown status.
    return "TODO"

print(normalize_record(" Amina ", "14", "YES"))`,
    tests: [
      { id: "function", title: "Define one focused normalization function", kind: "source-regex", pattern: "def\\s+normalize_record\\s*\\(", flags: "i", failure: "Define normalize_record(name, age_text, active_text)." },
      { id: "active", title: "Normalize a valid active learner", kind: "python-call-equals", expression: "normalize_record(' Amina ', '14', 'YES')", expected: "Amina|14|active", failure: "Trim the name, convert the age, and normalize YES to active." },
      { id: "inactive", title: "Normalize a valid inactive learner", kind: "python-call-equals", expression: "normalize_record('Mo', '16', 'no')", expected: "Mo|16|inactive", failure: "Normalize no to inactive." },
      { id: "age", title: "Reject a non-numeric age", kind: "python-call-equals", expression: "normalize_record('Ali', 'old', 'yes')", expected: "Check record", failure: "Catch or prevent invalid integer conversion." },
      { id: "status", title: "Reject an unknown status", kind: "python-call-equals", expression: "normalize_record('Ali', '15', 'maybe')", expected: "Check record", failure: "Only yes and no should become stored statuses." },
    ],
    hints: ["Use .strip() on text fields.", "Wrap int(age_text) in try/except ValueError.", "Normalize status with .lower() before comparing."],
  },
  {
    id: "python-data-summary",
    language: "python",
    title: "CSV-to-JSON category summary",
    eyebrow: "Files and data · lesson project",
    description: "Transform row-like records into a stable category count that could be saved as JSON.",
    skills: ["Structured records", "Dictionary counting", "Sorting", "Missing values"],
    starter: `def category_summary(rows):
    # Count non-empty category values and return alphabetical key:value pairs.
    # Example: food:2|health:1
    return "TODO"

rows = [{"category": "food"}, {"category": "health"}, {"category": "food"}]
print(category_summary(rows))`,
    tests: [
      { id: "function", title: "Define category_summary", kind: "source-regex", pattern: "def\\s+category_summary\\s*\\(", flags: "i", failure: "Define category_summary(rows)." },
      { id: "counts", title: "Count repeated categories", kind: "python-call-equals", expression: "category_summary([{'category':'food'},{'category':'health'},{'category':'food'}])", expected: "food:2|health:1", failure: "Count each category and return keys in alphabetical order." },
      { id: "missing", title: "Ignore missing category values", kind: "python-call-equals", expression: "category_summary([{'category':'food'},{'name':'unknown'},{'category':''}])", expected: "food:1", failure: "Rows without a usable category should not create a category." },
      { id: "empty", title: "Handle an empty dataset", kind: "python-call-equals", expression: "category_summary([])", expected: "No data", failure: "Return No data when no valid category exists." },
    ],
    hints: ["Use row.get('category', '').strip().", "Store counts in a dictionary with counts.get(category, 0) + 1.", "Iterate over sorted(counts) when formatting the result."],
  },
  {
    id: "python-api-reader",
    language: "python",
    title: "Resilient API response reader",
    eyebrow: "APIs and libraries · lesson project",
    description: "Validate a saved response before displaying a useful resource, and explain common failure states safely.",
    skills: ["Status codes", "Nested dictionaries", "Validation", "Fallback messages"],
    starter: `def read_resource(response):
    # Handle status 200, 404, 429, and other server errors.
    # A successful response needs data.name and data.status.
    return "TODO"

sample = {"status": 200, "data": {"name": "Clinic", "status": "Open"}}
print(read_resource(sample))`,
    tests: [
      { id: "function", title: "Define the response reader", kind: "source-regex", pattern: "def\\s+read_resource\\s*\\(", flags: "i", failure: "Define read_resource(response)." },
      { id: "success", title: "Display validated success data", kind: "python-call-equals", expression: "read_resource({'status':200,'data':{'name':'Clinic','status':'Open'}})", expected: "Clinic | Open", failure: "Read the two required data fields only after a 200 status." },
      { id: "missing", title: "Reject incomplete success data", kind: "python-call-equals", expression: "read_resource({'status':200,'data':{'name':'Clinic'}})", expected: "Incomplete data", failure: "Validate required fields before displaying the response." },
      { id: "notfound", title: "Explain a 404", kind: "python-call-equals", expression: "read_resource({'status':404})", expected: "Resource not found", failure: "Map status 404 to a useful message." },
      { id: "rate", title: "Explain a 429", kind: "python-call-equals", expression: "read_resource({'status':429})", expected: "Try again later", failure: "Map status 429 to a retry-later message." },
      { id: "server", title: "Handle server failure", kind: "python-call-equals", expression: "read_resource({'status':500})", expected: "Service unavailable", failure: "Use a safe fallback for server errors." },
    ],
    hints: ["Read status with response.get('status').", "Handle non-200 statuses before reading data.", "For status 200, use response.get('data', {}) and validate both fields."],
  },
  {
    id: "python-course-class",
    language: "python",
    title: "Course progress class",
    eyebrow: "Object-oriented Python · lesson project",
    description: "Keep course data and progress behavior together while preserving independent state for each object.",
    skills: ["Classes", "Instances", "Methods", "Encapsulation"],
    starter: `class Course:
    def __init__(self, title, total_lessons, completed_lessons=0):
        self.title = title
        self.total_lessons = total_lessons
        self.completed_lessons = completed_lessons

    def record_completion(self):
        # Increase completion without passing total_lessons.
        pass

    def progress(self):
        # Return a whole-number percentage, or 0 when total_lessons is invalid.
        return 0

course = Course("Python", 5, 2)
print(course.progress())`,
    tests: [
      { id: "class", title: "Define the Course class", kind: "source-regex", pattern: "class\\s+Course\\s*[:(]", flags: "i", failure: "Define a class named Course." },
      { id: "progress", title: "Calculate progress", kind: "python-call-equals", expression: "Course('Python', 5, 2).progress()", expected: 40, failure: "Two of five lessons should be 40 percent." },
      { id: "zero", title: "Handle an invalid total safely", kind: "python-call-equals", expression: "Course('Empty', 0, 0).progress()", expected: 0, failure: "Avoid division by zero when total_lessons is not positive." },
      { id: "record", title: "Record one completion", kind: "python-call-equals", expression: "(lambda c: (c.record_completion(), c.progress())[1])(Course('Python', 4, 1))", expected: 50, failure: "record_completion should move one of four from 25 to 50 percent." },
      { id: "cap", title: "Do not exceed 100 percent", kind: "python-call-equals", expression: "(lambda c: (c.record_completion(), c.progress())[1])(Course('Python', 2, 2))", expected: 100, failure: "Do not increase completed_lessons beyond total_lessons." },
    ],
    hints: ["Only increment when completed_lessons < total_lessons.", "Check total_lessons <= 0 before dividing.", "Use round((completed_lessons / total_lessons) * 100)."],
  },
  {
    id: "python-item-lister",
    language: "python",
    title: "Console item-lister capstone",
    eyebrow: "Python capstone · complete system",
    description: "Model items with a class, summarize a collection, and establish the core behavior for commands, storage, and charts.",
    skills: ["Decomposition", "Classes", "Validation", "Aggregation"],
    starter: `class Item:
    def __init__(self, name, category, quantity):
        self.name = name.strip()
        self.category = category.strip()
        self.quantity = quantity

    def label(self):
        # Return NAME | CATEGORY | QUANTITY or "Invalid item".
        return "TODO"

def collection_summary(items):
    # Return "N items | total Q".
    return "TODO"

items = [Item("Rice", "Food", 3), Item("Soap", "Supplies", 4)]
for item in items:
    print(item.label())
print(collection_summary(items))`,
    tests: [
      { id: "class", title: "Define the Item class", kind: "source-regex", pattern: "class\\s+Item\\s*[:(]", flags: "i", failure: "Define a class named Item." },
      { id: "label", title: "Format one valid item", kind: "python-call-equals", expression: "Item('Rice', 'Food', 3).label()", expected: "Rice | Food | 3", failure: "Return the three validated fields in a consistent label." },
      { id: "invalid", title: "Reject an invalid item", kind: "python-call-equals", expression: "Item('', 'Food', 3).label()", expected: "Invalid item", failure: "An item needs a name, category, and non-negative quantity." },
      { id: "summary", title: "Summarize a collection", kind: "python-call-equals", expression: "collection_summary([Item('Rice','Food',3),Item('Soap','Supplies',4)])", expected: "2 items | total 7", failure: "Count the items and add their quantities." },
      { id: "empty", title: "Summarize an empty collection", kind: "python-call-equals", expression: "collection_summary([])", expected: "0 items | total 0", failure: "The empty collection should still have a predictable summary." },
    ],
    hints: ["Validate inside label before formatting.", "Use len(items) for the item count.", "Use sum(item.quantity for item in items) for the total quantity."],
  },
];
