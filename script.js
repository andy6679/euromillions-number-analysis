let draws = [];  // To store parsed data from CSV
let mainBallFreq = {};
let luckyStarFreq = {};

// Function to open the appropriate tab
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Function to upload and parse CSV file
document.getElementById("uploadFile").addEventListener("click", function () {
    const file = document.getElementById("fileInput").files[0];
    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const content = event.target.result;
        parseCSV(content);
    };
    reader.readAsText(file);
});

function parseCSV(data) {
    const rows = data.split("\n");
    draws = rows.map(row => row.split(","));
    analyzeData();
    displayCSV();
}

function displayCSV() {
    const tableBody = document.querySelector("#csvTable tbody");
    tableBody.innerHTML = '';
    draws.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell.trim();
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

function analyzeData() {
    mainBallFreq = {};
    luckyStarFreq = {};

    draws.forEach(draw => {
        const mainBalls = draw.slice(0, 5);  // First 5 columns are main balls
        const luckyStars = draw.slice(5);  // Last 2 columns are lucky stars

        // Filter out any invalid main ball and lucky star values
        const validMainBalls = mainBalls.filter(ball => isValidBall(ball));
        const validLuckyStars = luckyStars.filter(star => isValidStar(star));

        // Update frequencies
        validMainBalls.forEach(ball => {
            mainBallFreq[ball] = (mainBallFreq[ball] || 0) + 1;
        });

        validLuckyStars.forEach(star => {
            luckyStarFreq[star] = (luckyStarFreq[star] || 0) + 1;
        });
    });

    displayAnalysis();
}

// Check if the ball is a valid number
function isValidBall(ball) {
    return !isNaN(ball) && ball >= 1 && ball <= 50;
}

// Check if the star is a valid lucky star number
function isValidStar(star) {
    return !isNaN(star) && star >= 1 && star <= 12;
}

// Display frequency analysis
function displayAnalysis() {
    let resultHtml = '<h3>Main Balls Frequency:</h3><ul>';
    for (let ball in mainBallFreq) {
        resultHtml += `<li>Ball ${ball}: ${mainBallFreq[ball]} times</li>`;
    }
    resultHtml += '</ul><h3>Lucky Stars Frequency:</h3><ul>';
    for (let star in luckyStarFreq) {
        resultHtml += `<li>Lucky Star ${star}: ${luckyStarFreq[star]} times</li>`;
    }
    resultHtml += '</ul>';
    document.getElementById("analysisResults").innerHTML = resultHtml;
}

// Generate fresh number suggestions based on frequency analysis
function generateSuggestions() {
    // Select the most frequent main balls and lucky stars
    const mainBallsSorted = Object.entries(mainBallFreq).sort((a, b) => b[1] - a[1]);
    const luckyStarsSorted = Object.entries(luckyStarFreq).sort((a, b) => b[1] - a[1]);

    // Get the top 5 main balls and top 2 lucky stars (fresh every time)
    const mainBalls = getRandomElements(mainBallsSorted.slice(0, 5));
    const luckyStars = getRandomElements(luckyStarsSorted.slice(0, 2));

    // Display fresh suggestions
    let resultHtml = `<h3>Suggested Main Balls: ${mainBalls.join(', ')}</h3>`;
    resultHtml += `<h3>Suggested Lucky Stars: ${luckyStars.join(', ')}</h3>`;
    document.getElementById("suggestionResults").innerHTML = resultHtml;
}

// Helper function to randomly select a set of items
function getRandomElements(arr) {
    let randomIndexes = [];
    while(randomIndexes.length < arr.length) {
        let randomIndex = Math.floor(Math.random() * arr.length);
        if(randomIndexes.indexOf(randomIndex) === -1) randomIndexes.push(randomIndex);
    }
    return randomIndexes.map(index => arr[index][0]);
}

// Calculate probability of a given number based on frequency analysis
function calculateProbability() {
    const number = document.getElementById("inputNumber").value;
    const type = document.getElementById("numberType").value;
    let freqData = type === 'main' ? mainBallFreq : luckyStarFreq;

    const probability = (freqData[number] || 0) / draws.length * 100;
    document.getElementById("probabilityResult").innerHTML =
        `Probability of ${number} being drawn: ${probability.toFixed(2)}%`;
}

// Show popular combinations based on analysis
function showPopularCombinations() {
    const count = parseInt(document.getElementById("inputCount").value);
    const popularMainBalls = Object.entries(mainBallFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(item => item[0]);
    const popularLuckyStars = Object.entries(luckyStarFreq).sort((a, b) => b[1] - a[1]).slice(0, 2).map(item => item[0]);

    let combinations = [];
    for (let i = 0; i < count; i++) {
        let combo = [...popularMainBalls.slice(0, 5), ...popularLuckyStars.slice(0, 2)];
        combinations.push(combo);
    }

    document.getElementById("combinationResults").innerHTML = `<h3>Popular Combinations:</h3><ul>${combinations.map(combo => `<li>${combo.join(', ')}</li>`).join('')}</ul>`;
}
