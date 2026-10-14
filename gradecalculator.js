// Native browser alert notification
function showAlert(title, message, type = 'success') {
    alert(`${title}\n${message}`);
}
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.calc-section');

    tabs.forEach(tab => tab.classList.remove('active'));
    sections.forEach(sec => sec.classList.remove('active'));

    if (tabName === 'college') {
        tabs[0].classList.add('active');
        document.getElementById('college-section').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('highschool-section').classList.add('active');
    }
}

const collegeTbody = document.getElementById('college-tbody');

function addCollegeRow(name = '', units = '', grade = '') {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="e.g. Data Structures" value="${name}"></td>
        <td><input type="number" step="0.5" min="0.5" placeholder="3" value="${units}"></td>
        <td><input type="number" step="0.01" min="1.0" max="5.0" placeholder="1.75" value="${grade}"></td>
        <td><button type="button" class="icon-btn" onclick="removeRow(this)"><i class="fa-solid fa-trash-can"></i></button></td>
    `;
    collegeTbody.appendChild(row);
}

function removeRow(btn) {
    const row = btn.closest('tr');

    if (row.parentElement.rows.length > 1) {
        row.remove();
        showAlert("Removed! ♡", "The subject or component has been removed.", "success");
    } else {
        showAlert("Cannot Remove ♡", "You must keep at least one row.", "error");
    }
}

function resetCollegeForm() {
    collegeTbody.innerHTML = '';
    addCollegeRow();
    document.getElementById('college-result').classList.add('hidden');
    showAlert("Fresh Start! 🌸", "College GWA calculator has been cleared.", "success");
}

function calculateCollegeGWA() {
    const rows = collegeTbody.querySelectorAll('tr');
    let totalWeightedGrades = 0;
    let totalUnits = 0;

    for (let row of rows) {
        const subjectInput = row.cells[0].querySelector('input').value.trim();
        const unitsInput = row.cells[1].querySelector('input').value;
        const gradeInput = row.cells[2].querySelector('input').value;

        const units = parseFloat(unitsInput);
        const grade = parseFloat(gradeInput);

        if (
            subjectInput === '' ||
            unitsInput === '' ||
            gradeInput === '' ||
            isNaN(units) ||
            isNaN(grade) ||
            units <= 0 ||
            grade < 1.0 ||
            grade > 5.0
        ) {
            showAlert(
                "Invalid Input ♡",
                "Please enter a subject name, positive units, and grades between 1.00 and 5.00.",
                "error"
            );
            return;
        }

        totalWeightedGrades += (grade * units);
        totalUnits += units;
    }

    if (totalUnits === 0) {
        showAlert("Warning ♡", "Total units cannot be zero.", "error");
        return;
    }

    const gwa = totalWeightedGrades / totalUnits;
    const gwaFormatted = gwa.toFixed(2);

    document.getElementById('college-gwa-value').textContent = gwaFormatted;

    let remarkText = "Passed";

    if (gwa <= 1.20) remarkText = "🏆 Dean's Lister / Superior";
    else if (gwa <= 1.75) remarkText = "🌟 Above Average";
    else if (gwa <= 3.00) remarkText = "✅ Passed";
    else remarkText = "❌ Failed";

    document.getElementById('college-remark').textContent = `Status: ${remarkText}`;
    document.getElementById('college-result').classList.remove('hidden');

    showAlert("You did it! ♡", `Your College GWA is ${gwaFormatted}.`, "success");
}

const hsTbody = document.getElementById('hs-tbody');

function addHsRow(category = '', weight = '', score = '') {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="e.g. Written Works" value="${category}"></td>
        <td><input type="number" step="1" min="0" max="100" placeholder="30" value="${weight}"></td>
        <td><input type="number" step="0.01" min="0" max="100" placeholder="88" value="${score}"></td>
        <td><button type="button" class="icon-btn" onclick="removeRow(this)"><i class="fa-solid fa-trash-can"></i></button></td>
    `;
    hsTbody.appendChild(row);
}

function resetHsForm() {
    hsTbody.innerHTML = '';
    addHsRow();
    document.getElementById('hs-result').classList.add('hidden');
    showAlert("Fresh Start! ✨", "High School final grade calculator has been cleared.", "success");
}

function calculateHsGrade() {
    const rows = hsTbody.querySelectorAll('tr');
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (let row of rows) {
        const categoryInput = row.cells[0].querySelector('input').value.trim();
        const weightInput = row.cells[1].querySelector('input').value;
        const scoreInput = row.cells[2].querySelector('input').value;

        const weight = parseFloat(weightInput);
        const score = parseFloat(scoreInput);

        if (
            categoryInput === '' ||
            weightInput === '' ||
            scoreInput === '' ||
            isNaN(weight) ||
            isNaN(score) ||
            weight < 0 ||
            weight > 100 ||
            score < 0 ||
            score > 100
        ) {
            showAlert(
                "Invalid Input ♡",
                "Please enter a category and valid weights and scores from 0 to 100.",
                "error"
            );
            return;
        }

        totalWeightedScore += (score * (weight / 100));
        totalWeight += weight;
    }

    if (Math.abs(totalWeight - 100) > 0.001) {
        showAlert(
            "Weight Error ♡",
            `Total weights must equal 100%. Current total is ${totalWeight.toFixed(2)}%.`,
            "error"
        );
        return;
    }

    const hsFormatted = totalWeightedScore.toFixed(2);

    document.getElementById('hs-grade-value').textContent = hsFormatted;

    let remarkText = "Passed";

    if (totalWeightedScore >= 90) remarkText = "🌟 Outstanding / With Honors";
    else if (totalWeightedScore >= 80) remarkText = "✅ Satisfactory";
    else if (totalWeightedScore >= 75) remarkText = "✔️ Passed";
    else remarkText = "❌ Needs Improvement (Failed)";

    document.getElementById('hs-remark').textContent = `Status: ${remarkText}`;
    document.getElementById('hs-result').classList.remove('hidden');

    showAlert("Well Done! ♡", `Your Final High School Grade is ${hsFormatted}%.`, "success");
}
window.onload = () => {
    addCollegeRow();
    addHsRow();
};
