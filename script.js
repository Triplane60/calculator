/* =========================================================
   Student Grade Calculator — script.js
   Decisions use if-else statements; collections are
   processed with loops (for / for...of).
   ========================================================= */

"use strict";

// ---------------------------------------------------------
// Constants
// ---------------------------------------------------------
const LETTER_GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
const COURSE_LEVELS = ["Regular", "Honors", "AP / IB"];
const PASSING_SCORE = 60;

// ---------------------------------------------------------
// Grade logic (if-else chains)
// ---------------------------------------------------------
function getLetterGrade(score) {
  if (score >= 97) return "A+";
  else if (score >= 93) return "A";
  else if (score >= 90) return "A-";
  else if (score >= 87) return "B+";
  else if (score >= 83) return "B";
  else if (score >= 80) return "B-";
  else if (score >= 77) return "C+";
  else if (score >= 73) return "C";
  else if (score >= 70) return "C-";
  else if (score >= 67) return "D+";
  else if (score >= 63) return "D";
  else if (score >= 60) return "D-";
  else return "F";
}

function getGradePoints(letter) {
  if (letter === "A+" || letter === "A") return 4.0;
  else if (letter === "A-") return 3.7;
  else if (letter === "B+") return 3.3;
  else if (letter === "B") return 3.0;
  else if (letter === "B-") return 2.7;
  else if (letter === "C+") return 2.3;
  else if (letter === "C") return 2.0;
  else if (letter === "C-") return 1.7;
  else if (letter === "D+") return 1.3;
  else if (letter === "D") return 1.0;
  else if (letter === "D-") return 0.7;
  else return 0.0; // F
}

// ---------------------------------------------------------
// Small helpers
// ---------------------------------------------------------
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNumber(value, decimals) {
  const places = decimals === undefined ? 2 : decimals;
  const fixed = Number(value).toFixed(places);
  if (fixed.indexOf(".") !== -1) {
    return fixed.replace(/0+$/, "").replace(/\.$/, "");
  }
  return fixed;
}

function showFeedback(element, type, message) {
  element.textContent = message;
  element.className = "feedback " + type;
  element.hidden = false;
}

function clearFeedback(element) {
  element.textContent = "";
  element.hidden = true;
}

function fail(messageElement, resultElement, message) {
  showFeedback(messageElement, "error", message);
  resultElement.hidden = true;
}

// ---------------------------------------------------------
// Small DOM helpers
// ---------------------------------------------------------
function createInput(className, type, placeholder, options) {
  const settings = options || {};
  const input = document.createElement("input");
  input.type = type;
  input.className = className;
  input.placeholder = placeholder;
  if (settings.value !== undefined && settings.value !== null) input.value = settings.value;
  if (settings.min !== undefined) input.min = settings.min;
  if (settings.max !== undefined) input.max = settings.max;
  if (settings.step !== undefined) input.step = settings.step;
  return input;
}

function createSelect(className, items, selectedValue) {
  const select = document.createElement("select");
  select.className = className;
  for (const item of items) { // loop through every possible option
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    if (item === selectedValue) option.selected = true;
    select.appendChild(option);
  }
  return select;
}

function createCell(label, children) {
  const td = document.createElement("td");
  if (label) td.dataset.label = label;
  for (const child of children) td.appendChild(child);
  return td;
}

function createRemoveButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "remove-btn";
  button.textContent = "×";
  button.setAttribute("aria-label", "Remove this row");
  return button;
}

// ---------------------------------------------------------
// Dynamic table rows
// ---------------------------------------------------------
function addWeightedRow(values) {
  const data = values || {};
  const tbody = document.getElementById("weighted-rows");
  const tr = document.createElement("tr");

  tr.appendChild(createCell("Category", [createInput("w-name", "text", "e.g. Homework", { value: data.name })]));
  tr.appendChild(createCell("Weight (%)", [createInput("w-weight", "number", "20", { value: data.weight, min: "0", max: "100", step: "0.1" })]));
  tr.appendChild(createCell("Score (%)", [createInput("w-score", "number", "85", { value: data.score, min: "0", max: "100", step: "0.1" })]));
  tr.appendChild(createCell("", [createRemoveButton()]));

  tbody.appendChild(tr);
}

function addGpaRow(values) {
  const data = values || {};
  const tbody = document.getElementById("gpa-rows");
  const tr = document.createElement("tr");

  tr.appendChild(createCell("Course", [createInput("g-name", "text", "e.g. Calculus II", { value: data.name })]));
  tr.appendChild(createCell("Letter grade", [createSelect("g-letter", LETTER_GRADES, data.letter || "A")]));

  const levelCell = createCell("Course level", [createSelect("g-level", COURSE_LEVELS, data.level || "Regular")]);
  levelCell.classList.add("col-level");
  tr.appendChild(levelCell);

  tr.appendChild(createCell("Credits", [createInput("g-credits", "number", "3", { value: data.credits, min: "0.5", max: "10", step: "0.5" })]));
  tr.appendChild(createCell("", [createRemoveButton()]));

  tbody.appendChild(tr);
}

function handleRemoveClick(event) {
  const button = event.target.closest(".remove-btn");
  if (!button) return;
  const tbody = button.closest("tbody");
  button.closest("tr").remove();
  // always keep at least one blank row available
  if (tbody.rows.length === 0) {
    if (tbody.id === "weighted-rows") addWeightedRow();
    else addGpaRow();
  }
}

// The college scale hides the "course level" column; high school shows it.
function updateLevelVisibility() {
  const scale = document.getElementById("gpa-scale").value;
  const levelCells = document.querySelectorAll(".col-level");
  for (const cell of levelCells) {
    if (scale === "highschool") cell.classList.remove("hidden");
    else cell.classList.add("hidden");
  }
  const formula = document.getElementById("gpa-formula");
  if (scale === "highschool") {
    formula.textContent = "Formula: GPA = Σ (grade points × credits) ÷ Σ credits — Honors +0.5 and AP/IB +1.0 (maximum 5.0).";
  } else {
    formula.textContent = "Formula: GPA = Σ (grade points × credits) ÷ Σ credits on the unweighted 4.0 scale.";
  }
}

// ---------------------------------------------------------
// 1) Weighted grade calculator
// ---------------------------------------------------------
function calculateWeighted() {
  const messageEl = document.getElementById("weighted-message");
  const resultEl = document.getElementById("weighted-result");
  const rows = document.querySelectorAll("#weighted-rows tr");

  let totalWeight = 0;
  let finalScore = 0;
  const details = [];

  // LOOP 1: read and validate every category row
  for (const row of rows) {
    const name = row.querySelector(".w-name").value.trim();
    const weightRaw = row.querySelector(".w-weight").value.trim();
    const scoreRaw = row.querySelector(".w-score").value.trim();

    // skip rows that were never filled in
    if (name === "" && weightRaw === "" && scoreRaw === "") continue;

    const weight = Number(weightRaw);
    const score = Number(scoreRaw);

    // IF-ELSE validation 1: missing or non-numeric values
    if (weightRaw === "" || scoreRaw === "" || Number.isNaN(weight) || Number.isNaN(score)) {
      fail(messageEl, resultEl, "⚠️ Every filled row needs both a weight and a score. Check the row \"" + (name || "without a name") + "\".");
      return;
    }
    // IF-ELSE validation 2: out of range values
    else if (weight < 0 || weight > 100 || score < 0 || score > 100) {
      fail(messageEl, resultEl, "⚠️ Weight and score must both be between 0 and 100. Check the row \"" + name + "\".");
      return;
    }

    totalWeight += weight;
    finalScore += (weight / 100) * score;
    details.push({ name: name || "Untitled category", weight: weight, score: score });
  }

  // IF-ELSE validation 3: nothing entered
  if (details.length === 0) {
    fail(messageEl, resultEl, "⚠️ Add at least one category with a weight and a score.");
    return;
  }
  // IF-ELSE validation 4: weights must total 100%
  else if (Math.abs(totalWeight - 100) > 0.01) {
    fail(messageEl, resultEl, "⚠️ The weights must add up to 100%. Your total is " + formatNumber(totalWeight) + "%.");
    return;
  }

  renderWeightedResult(finalScore, details);
}

function renderWeightedResult(finalScore, details) {
  const messageEl = document.getElementById("weighted-message");
  const resultEl = document.getElementById("weighted-result");
  const letter = getLetterGrade(finalScore);
  const points = getGradePoints(letter);
  const letterClass = "letter-" + letter.charAt(0).toLowerCase();

  // IF-ELSE: turn the number into friendly feedback
  let remark;
  if (finalScore >= 90) remark = "🌟 Excellent work — A range (Honor Roll / Dean's List territory).";
  else if (finalScore >= 80) remark = "👍 Great job — B range, a solid standing.";
  else if (finalScore >= 70) remark = "📖 Average — C range. Review your lowest categories to climb a letter.";
  else if (finalScore >= 60) remark = "⚠️ Passing, but D range — extra credit or tutoring could help.";
  else remark = "🚨 Below passing (F range). Talk to your teacher about make-up work.";

  // LOOP 2: build the breakdown table
  let rowsHtml = "";
  for (const item of details) {
    const contribution = (item.weight / 100) * item.score;
    rowsHtml +=
      "<tr>" +
      '<td data-label="Category">' + escapeHtml(item.name) + "</td>" +
      '<td data-label="Weight">' + formatNumber(item.weight) + "%</td>" +
      '<td data-label="Score">' + formatNumber(item.score) + "%</td>" +
      '<td data-label="Letter">' + getLetterGrade(item.score) + "</td>" +
      '<td data-label="Contribution">' + formatNumber(contribution) + " pts</td>" +
      "</tr>";
  }

  resultEl.innerHTML =
    '<div class="result-hero">' +
      '<div class="score-circle ' + letterClass + '">' + letter + "</div>" +
      '<div>' +
        '<p class="result-label">Final weighted grade</p>' +
        '<p class="result-score">' + formatNumber(finalScore) + "%</p>" +
        '<p class="result-sub">Grade points: ' + points.toFixed(1) + " / 4.0</p>" +
      "</div>" +
    "</div>" +
    '<p class="result-remark">' + remark + "</p>" +
    '<p class="result-heading">Category breakdown</p>' +
    '<div class="table-wrap"><table class="data-table">' +
      "<thead><tr><th>Category</th><th>Weight</th><th>Score</th><th>Letter</th><th>Contribution</th></tr></thead>" +
      "<tbody>" + rowsHtml + "</tbody>" +
    "</table></div>";

  clearFeedback(messageEl);
  resultEl.hidden = false;
}

// ---------------------------------------------------------
// 2) GPA calculator
// ---------------------------------------------------------
function calculateGpa() {
  const messageEl = document.getElementById("gpa-message");
  const resultEl = document.getElementById("gpa-result");
  const rows = document.querySelectorAll("#gpa-rows tr");
  const scale = document.getElementById("gpa-scale").value;

  let totalCredits = 0;
  let qualityPoints = 0;
  const courses = [];

  // LOOP 3: read and validate every course row
  for (const row of rows) {
    const name = row.querySelector(".g-name").value.trim();
    const letter = row.querySelector(".g-letter").value;
    const level = row.querySelector(".g-level").value;
    const creditsRaw = row.querySelector(".g-credits").value.trim();

    // skip rows that were never filled in
    if (name === "" && creditsRaw === "") continue;

    const credits = Number(creditsRaw);

    // IF-ELSE validation: credits must be a positive number
    if (creditsRaw === "" || Number.isNaN(credits) || credits <= 0) {
      fail(messageEl, resultEl, "⚠️ Enter credit hours greater than 0 for \"" + (name || "each course") + "\".");
      return;
    } else if (credits > 10) {
      fail(messageEl, resultEl, "⚠️ Credit hours per course should be 10 or less. Check \"" + name + "\".");
      return;
    }

    // IF-ELSE: grade points from the letter grade
    let points = getGradePoints(letter);

    // IF-ELSE: high-school weighted bonuses (Honors +0.5, AP/IB +1.0, cap 5.0)
    if (scale === "highschool") {
      if (letter === "F") {
        points = 0.0; // an F never earns a weighting bonus
      } else {
        if (level === "Honors") points += 0.5;
        else if (level === "AP / IB") points += 1.0;
        if (points > 5.0) points = 5.0;
      }
    }

    totalCredits += credits;
    qualityPoints += points * credits;
    courses.push({ name: name || "Unnamed course", letter: letter, level: level, credits: credits, points: points });
  }

  // IF-ELSE validation: no courses entered
  if (courses.length === 0) {
    fail(messageEl, resultEl, "⚠️ Add at least one course with credit hours.");
    return;
  }

  const gpa = qualityPoints / totalCredits;
  renderGpaResult(gpa, totalCredits, courses, scale);
}

function renderGpaResult(gpa, totalCredits, courses, scale) {
  const messageEl = document.getElementById("gpa-message");
  const resultEl = document.getElementById("gpa-result");
  const isHighSchool = scale === "highschool";

  // IF-ELSE: classify the GPA
  let classification;
  if (gpa >= 3.9) classification = "🌟 Outstanding — Dean's List / Summa Cum Laude range.";
  else if (gpa >= 3.5) classification = "🏆 Honor Roll — Magna Cum Laude range.";
  else if (gpa >= 3.0) classification = "👍 Good academic standing.";
  else if (gpa >= 2.0) classification = "🪨 Satisfactory — above the usual 2.0 graduation minimum.";
  else classification = "⚠️ Below 2.0 — consider tutoring or meeting with your academic advisor.";

  const scaleLabel = isHighSchool
    ? "High school weighted (Honors +0.5 · AP/IB +1.0, max 5.0)"
    : "College unweighted 4.0 scale";

  // LOOP 4: build the course table
  let rowsHtml = "";
  for (const course of courses) {
    rowsHtml +=
      "<tr>" +
      '<td data-label="Course">' + escapeHtml(course.name) + "</td>" +
      '<td data-label="Grade">' + course.letter + "</td>";
    if (isHighSchool) {
      rowsHtml += '<td data-label="Level">' + course.level + "</td>";
    }
    rowsHtml +=
      '<td data-label="Credits">' + formatNumber(course.credits, 1) + "</td>" +
      '<td data-label="Points">' + course.points.toFixed(1) + "</td>" +
      "</tr>";
  }

  let levelHeading = "";
  if (isHighSchool) levelHeading = "<th>Level</th>";

  resultEl.innerHTML =
    '<div class="result-hero">' +
      '<div class="score-circle">' + gpa.toFixed(2) + "</div>" +
      "<div>" +
        '<p class="result-label">Cumulative GPA</p>' +
        '<p class="result-score">' + gpa.toFixed(2) + " / " + (isHighSchool ? "5.0" : "4.0") + "</p>" +
        '<p class="result-sub">' + courses.length + " course(s) · " + formatNumber(totalCredits, 1) + " credit hours · " + scaleLabel + "</p>" +
      "</div>" +
    "</div>" +
    '<p class="result-remark">' + classification + "</p>" +
    '<p class="result-heading">Course breakdown</p>' +
    '<div class="table-wrap"><table class="data-table">' +
      "<thead><tr><th>Course</th><th>Grade</th>" + levelHeading + "<th>Credits</th><th>Points</th></tr></thead>" +
      "<tbody>" + rowsHtml + "</tbody>" +
    "</table></div>";

  clearFeedback(messageEl);
  resultEl.hidden = false;
}

// ---------------------------------------------------------
// 3) Score analyzer
// ---------------------------------------------------------
function sortAscending(values) {
  const arr = values.slice();
  // bubble sort using nested loops (needed for the median)
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}

function runStats() {
  const messageEl = document.getElementById("stats-message");
  const resultEl = document.getElementById("stats-result");
  const raw = document.getElementById("stats-input").value.trim();

  // IF-ELSE validation: empty input
  if (raw === "") {
    fail(messageEl, resultEl, "⚠️ Enter at least one score (0–100) to analyze.");
    return;
  }

  const tokens = raw.split(/[\s,;|]+/);
  const validScores = [];
  const notNumbers = [];
  const outOfRange = [];

  // LOOP 5: sort every token into valid / invalid buckets
  for (const token of tokens) {
    if (token === "") continue;
    const value = Number(token);
    if (Number.isNaN(value)) notNumbers.push(token);
    else if (value < 0 || value > 100) outOfRange.push(token);
    else validScores.push(value);
  }

  if (validScores.length === 0) {
    fail(messageEl, resultEl, "⚠️ No valid scores found. Enter numbers between 0 and 100.");
    return;
  }

  // LOOP 6: one pass for sum, highest, lowest and pass/fail counts
  let sum = 0;
  let highest = validScores[0];
  let lowest = validScores[0];
  let passing = 0;
  let failing = 0;
  for (const score of validScores) {
    sum += score;
    if (score > highest) highest = score;
    if (score < lowest) lowest = score;
    if (score >= PASSING_SCORE) passing++;
    else failing++;
  }
  const average = sum / validScores.length;

  const sorted = sortAscending(validScores);
  const middle = Math.floor(sorted.length / 2);
  // IF-ELSE: median differs for odd vs even counts
  let median;
  if (sorted.length % 2 === 1) median = sorted[middle];
  else median = (sorted[middle - 1] + sorted[middle]) / 2;

  // LOOP 7: letter-grade distribution
  const distribution = { "A": 0, "B": 0, "C": 0, "D": 0, "F": 0 };
  for (const score of sorted) {
    const letter = getLetterGrade(score);
    let bucket;
    if (letter.charAt(0) === "A") bucket = "A";
    else if (letter.charAt(0) === "B") bucket = "B";
    else if (letter.charAt(0) === "C") bucket = "C";
    else if (letter.charAt(0) === "D") bucket = "D";
    else bucket = "F";
    distribution[bucket]++;
  }

  // IF-ELSE: warn about any skipped tokens
  const skipped = [];
  if (notNumbers.length > 0) skipped.push("not a number: " + notNumbers.join(", "));
  if (outOfRange.length > 0) skipped.push("outside 0–100: " + outOfRange.join(", "));
  if (skipped.length > 0) showFeedback(messageEl, "warning", "⚠️ Skipped " + skipped.join(" · "));
  else clearFeedback(messageEl);

  renderStatsResult({
    count: validScores.length,
    average: average,
    median: median,
    highest: highest,
    lowest: lowest,
    range: highest - lowest,
    passing: passing,
    failing: failing,
    distribution: distribution
  });
  resultEl.hidden = false;
}

function renderStatsResult(stats) {
  const resultEl = document.getElementById("stats-result");

  // IF-ELSE: remark based on the class average
  let remark;
  if (stats.average >= 90) remark = "🌟 Average is an A — excellent!";
  else if (stats.average >= 80) remark = "👍 Average is a B — strong work.";
  else if (stats.average >= 70) remark = "📖 Average is a C — steady, with room to grow.";
  else if (stats.average >= 60) remark = "⚠️ Average is a D — passing, but consider extra practice.";
  else remark = "🚨 Average is below passing — reach out for help early.";

  const passRate = (stats.passing / stats.count) * 100;

  function statBox(value, label) {
    return '<div class="stat-box"><div class="stat-value">' + value + '</div><div class="stat-label">' + label + "</div></div>";
  }

  // LOOP 8: build the distribution rows
  const grades = ["A", "B", "C", "D", "F"];
  let distHtml = "";
  for (const grade of grades) {
    const count = stats.distribution[grade];
    const share = (count / stats.count) * 100;
    distHtml +=
      "<tr>" +
      '<td data-label="Grade">' + grade + " range</td>" +
      '<td data-label="Scores">' + count + "</td>" +
      '<td data-label="Share"><span class="share-cell">' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + share.toFixed(1) + '%"></span></span>' +
        "<span>" + share.toFixed(1) + "%</span>" +
      "</span></td>" +
      "</tr>";
  }

  resultEl.innerHTML =
    '<div class="result-hero">' +
      '<div class="score-circle">' + formatNumber(stats.average, 1) + "</div>" +
      "<div>" +
        '<p class="result-label">Average score</p>' +
        '<p class="result-score">' + formatNumber(stats.average) + "%</p>" +
        '<p class="result-sub">Median ' + formatNumber(stats.median) + "% · " + stats.count + " score(s)</p>" +
      "</div>" +
    "</div>" +
    '<p class="result-remark">' + remark + "</p>" +
    '<div class="stats-grid">' +
      statBox(stats.count, "Scores") +
      statBox(formatNumber(stats.average) + "%", "Average") +
      statBox(formatNumber(stats.median) + "%", "Median") +
      statBox(formatNumber(stats.highest) + "%", "Highest") +
      statBox(formatNumber(stats.lowest) + "%", "Lowest") +
      statBox(formatNumber(stats.range) + " pts", "Range") +
      statBox(passRate.toFixed(1) + "%", "Pass rate") +
      statBox(stats.failing, "Below " + PASSING_SCORE + "%") +
    "</div>" +
    '<p class="result-heading">Letter-grade distribution</p>' +
    '<div class="table-wrap"><table class="data-table">' +
      "<thead><tr><th>Grade</th><th>Scores</th><th>Share</th></tr></thead>" +
      "<tbody>" + distHtml + "</tbody>" +
    "</table></div>";
}

// ---------------------------------------------------------
// Examples & resets
// ---------------------------------------------------------
function clearSection(messageId, resultId) {
  document.getElementById(messageId).hidden = true;
  document.getElementById(resultId).hidden = true;
}

function loadWeightedExample() {
  const tbody = document.getElementById("weighted-rows");
  tbody.innerHTML = "";
  const sample = [
    { name: "Homework", weight: "20", score: "95" },
    { name: "Quizzes", weight: "20", score: "88" },
    { name: "Midterm Exam", weight: "25", score: "79" },
    { name: "Final Exam", weight: "35", score: "91" }
  ];
  for (const item of sample) addWeightedRow(item); // LOOP: fill every example row
  calculateWeighted();
}

function resetWeighted() {
  const tbody = document.getElementById("weighted-rows");
  tbody.innerHTML = "";
  for (let i = 0; i < 3; i++) addWeightedRow(); // LOOP: three fresh blank rows
  clearSection("weighted-message", "weighted-result");
}

function loadGpaExample() {
  const tbody = document.getElementById("gpa-rows");
  tbody.innerHTML = "";
  const sample = [
    { name: "Calculus II", letter: "A-", level: "Regular", credits: "4" },
    { name: "English Composition", letter: "B+", level: "Regular", credits: "3" },
    { name: "Introduction to Psychology", letter: "A", level: "Regular", credits: "3" },
    { name: "AP Biology", letter: "A-", level: "AP / IB", credits: "4" }
  ];
  for (const item of sample) addGpaRow(item);
  updateLevelVisibility();
  calculateGpa();
}

function resetGpa() {
  const tbody = document.getElementById("gpa-rows");
  tbody.innerHTML = "";
  for (let i = 0; i < 3; i++) addGpaRow();
  updateLevelVisibility();
  clearSection("gpa-message", "gpa-result");
}

function loadStatsExample() {
  document.getElementById("stats-input").value = "88, 92, 76, 95, 84, 67, 91, 73, 85, 90, 58, 79";
  runStats();
}

function clearStats() {
  document.getElementById("stats-input").value = "";
  clearSection("stats-message", "stats-result");
}

// ---------------------------------------------------------
// Tabs
// ---------------------------------------------------------
function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  for (const button of buttons) {
    button.addEventListener("click", function () {
      const targetId = button.dataset.tab;
      // IF-ELSE-free toggle loop: activate the clicked tab, deactivate the rest
      for (const btn of buttons) {
        const isActive = btn === button;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
      }
      for (const panel of document.querySelectorAll(".panel")) {
        panel.classList.toggle("active", panel.id === targetId);
      }
    });
  }
}

function attachEnterShortcut(tbodyId, calculateFunction) {
  document.getElementById(tbodyId).addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      calculateFunction();
    }
  });
}

// ---------------------------------------------------------
// Initialize everything
// ---------------------------------------------------------
function init() {
  initTabs();

  // start with three blank rows in each table
  for (let i = 0; i < 3; i++) {
    addWeightedRow();
    addGpaRow();
  }

  // remove-row buttons (event delegation on the table bodies)
  document.getElementById("weighted-rows").addEventListener("click", handleRemoveClick);
  document.getElementById("gpa-rows").addEventListener("click", handleRemoveClick);

  // weighted buttons
  document.getElementById("weighted-add").addEventListener("click", function () { addWeightedRow(); });
  document.getElementById("weighted-sample").addEventListener("click", loadWeightedExample);
  document.getElementById("weighted-reset").addEventListener("click", resetWeighted);
  document.getElementById("weighted-calc").addEventListener("click", calculateWeighted);

  // gpa buttons
  document.getElementById("gpa-add").addEventListener("click", function () { addGpaRow(); });
  document.getElementById("gpa-sample").addEventListener("click", loadGpaExample);
  document.getElementById("gpa-reset").addEventListener("click", resetGpa);
  document.getElementById("gpa-calc").addEventListener("click", calculateGpa);
  document.getElementById("gpa-scale").addEventListener("change", updateLevelVisibility);
  updateLevelVisibility();

  // score analyzer buttons
  document.getElementById("stats-sample").addEventListener("click", loadStatsExample);
  document.getElementById("stats-clear").addEventListener("click", clearStats);
  document.getElementById("stats-run").addEventListener("click", runStats);
  document.getElementById("stats-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      runStats();
    }
  });

  // press Enter inside a table to calculate
  attachEnterShortcut("weighted-rows", calculateWeighted);
  attachEnterShortcut("gpa-rows", calculateGpa);
}

init();





