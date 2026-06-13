const mpszToUnicode = {
    "1m":"🀇", "2m":"🀈", "3m":"🀉", "4m":"🀊", "5m":"🀋", "6m":"🀌", "7m":"🀍", "8m":"🀎", "9m":"🀏",
    "1p":"🀙", "2p":"🀚", "3p":"🀛", "4p":"🀜", "5p":"🀝", "6p":"🀞", "7p":"🀟", "8p":"🀠", "9p":"🀡",
    "1s":"🀐", "2s":"🀑", "3s":"🀒", "4s":"🀓", "5s":"🀔", "6s":"🀕", "7s":"🀖", "8s":"🀗", "9s":"🀘",
    "1z":"🀀", "2z":"🀁", "3z":"🀂", "4z":"🀃", "5z":"🀆", "6z":"🀅", "7z":"🀄"
};

const tileTextMap = {
    "🀇":"1m (一萬)", "🀈":"2m (二萬)", "🀉":"3m (三萬)", "🀊":"4m (四萬)", "🀋":"5m (五萬)", "🀌":"6m (六萬)", "🀍":"7m (七萬)", "🀎":"8m (八萬)", "🀏":"9m (九萬)",
    "🀙":"1p (一筒)", "🀚":"2p (二筒)", "🀛":"3p (三筒)", "🀜":"4p (四筒)", "🀝":"5p (五筒)", "🀞":"6p (六筒)", "🀟":"7p (七筒)", "🀠":"8p (八筒)", "🀡":"9p (九筒)",
    "🀐":"1s (一索)", "🀑":"2s (二索)", "🀒":"3s (三索)", "🀓":"4s (四索)", "🀔":"5s (五索)", "🀕":"6s (六索)", "🀖":"7s (七索)", "🀗":"8s (八索)", "🀘":"9s (九索)",
    "🀀":"東", "🀁":"南", "🀂":"西", "🀃":"北", "🀄":"中", "🀅":"發", "🀆":"白"
};

const fullKeyboard = [
    ["🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏"],
    ["🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡"],
    ["🀐","🀑","🀒","🀓","🀔","🀕","🀖","🀗","🀘"],
    ["🀀","🀁","🀂","🀃","🀄","🀅","🀆"]
];

let questionBank = [];
let currentQuestion = null;
let selectedTiles = [];
let score = 0;
let timeLeft = 180;
let timerInterval;
let globalPlayerName = "";
let usedIndices = [];
let questionNumber = 0;
let isAnswering = false;

window.onload = async () => {
    try {
        const res = await fetch('/questions.json');
        questionBank = await res.json();
        questionBank.forEach(q => {
            q.hand = q.hand.map(tile => mpszToUnicode[tile] || tile);
            q.waits = q.waits.map(tile => mpszToUnicode[tile] || tile);
        });
    } catch (e) {
        console.error("載入題庫失敗", e);
    }
    fetchLeaderboard();
};

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function startGame() {
    const nameInput = document.getElementById('player-name').value.trim();
    if (!nameInput) {
        alert("請先輸入您的帥氣暱稱才能開始挑戰喔！");
        return;
    }
    globalPlayerName = nameInput;

    if (questionBank.length === 0) {
        alert("題庫尚未載入完畢，請稍後再試");
        return;
    }

    score = 0;
    timeLeft = 180;
    usedIndices = [];
    questionNumber = 0;
    isAnswering = false;
    document.getElementById('score').innerText = score;
    showScreen('screen-game');

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);

    nextQuestion();
}

function getRandomUnusedQuestion() {
    if (usedIndices.length >= questionBank.length) {
        usedIndices = [];
    }
    let idx;
    do {
        idx = Math.floor(Math.random() * questionBank.length);
    } while (usedIndices.includes(idx));
    usedIndices.push(idx);
    return questionBank[idx];
}

function nextQuestion() {
    selectedTiles = [];
    isAnswering = false;
    currentQuestion = getRandomUnusedQuestion();
    questionNumber++;
    document.getElementById('desc-box').innerHTML = `<span style="color:#e67e22;">第 ${questionNumber} 題</span> — ${currentQuestion.desc}`;

    const handBox = document.getElementById('tenpai-hand-box');
    handBox.innerHTML = '';
    currentQuestion.hand.forEach(t => {
        handBox.innerHTML += `<div class="tile question-tile">${t}</div>`;
    });

    const paletteBox = document.getElementById('palette-box');
    paletteBox.innerHTML = '';

    fullKeyboard.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.style.display = 'flex';
        rowDiv.style.justifyContent = 'center';
        rowDiv.style.flexWrap = 'wrap';
        rowDiv.style.gap = '8px';
        rowDiv.style.marginBottom = '10px';
        rowDiv.style.width = '100%';

        row.forEach(tileText => {
            const btn = document.createElement('div');
            btn.className = 'tile selection-tile';
            btn.innerText = tileText;
            btn.onclick = () => toggleSelect(tileText, btn);
            rowDiv.appendChild(btn);
        });
        paletteBox.appendChild(rowDiv);
    });
}

function toggleSelect(tileText, btnElement) {
    if (isAnswering) return;
    if (selectedTiles.includes(tileText)) {
        selectedTiles = selectedTiles.filter(t => t !== tileText);
        btnElement.classList.remove('selected');
    } else {
        selectedTiles.push(tileText);
        btnElement.classList.add('selected');
    }
}

async function checkAnswer() {
    if (isAnswering) return;
    if (selectedTiles.length === 0) return alert("請至少選一張牌喔！");

    isAnswering = true;
    const isCorrect = selectedTiles.length === currentQuestion.waits.length &&
                      selectedTiles.every(val => currentQuestion.waits.includes(val));

    const paletteBox = document.getElementById('palette-box');
    const allTiles = paletteBox.querySelectorAll('.selection-tile');
    allTiles.forEach(t => t.style.pointerEvents = 'none');

    if (isCorrect) {
        score++;
        document.getElementById('score').innerText = score;
        document.getElementById('desc-box').innerHTML += ' <span style="color:#2ecc71;font-weight:bold;">✓ 正確！</span>';
        await sleep(800);
        nextQuestion();
    } else {
        const textWaits = currentQuestion.waits.map(t => tileTextMap[t] || t);
        document.getElementById('desc-box').innerHTML += ` <span style="color:#e74c3c;font-weight:bold;">✗ 正確聽牌：${textWaits.join(', ')}</span>`;
        await sleep(2000);
        nextQuestion();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function endGame() {
    clearInterval(timerInterval);
    document.getElementById('final-score').innerText = score;
    showScreen('screen-gameover');

    document.getElementById('upload-status').innerText = "成績上傳中... 📡";

    try {
        await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: globalPlayerName, score: score })
        });
        document.getElementById('upload-status').innerText = "✅ 成績上傳成功！";
        document.getElementById('btn-back').style.display = "inline-block";
    } catch(e) {
        document.getElementById('upload-status').innerText = "❌ 伺服器連線失敗，請檢查 Server 是否開啟。";
    }
}

function backToLobby() {
    fetchLeaderboard();
    document.getElementById('btn-back').style.display = "none";
    showScreen('screen-lobby');
}

async function fetchLeaderboard() {
    try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();

        const tbody = document.getElementById('leaderboard-body');
        tbody.innerHTML = '';

        data.forEach((player, index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${player.name}</td>
                    <td style="color:#f1c40f; font-weight:bold;">${player.score}</td>
                </tr>
            `;
        });
    } catch(e) {
        console.log("尚未連接伺服器或無排行榜資料");
    }
}
