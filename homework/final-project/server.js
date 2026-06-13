const express = require('express');
const fs = require('fs'); // 🌟 引入 Node.js 內建的檔案系統模組
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// 設定實體 JSON 檔案的儲存路徑
const FILE_PATH = path.join(__dirname, 'leaderboard.json');

// 🌟 伺服器啟動時：自動檢查有沒有舊的排行榜檔案，有的話就讀取出來
let leaderboard = [];
if (fs.existsSync(FILE_PATH)) {
    try {
        const fileData = fs.readFileSync(FILE_PATH, 'utf-8');
        leaderboard = JSON.parse(fileData); // 將文字轉換回 JavaScript 陣列
        console.log("💾 成功從硬碟載入歷屆排行榜資料！");
    } catch (e) {
        console.error("❌ 讀取排行榜檔案失敗，初始化為空陣列", e);
        leaderboard = [];
    }
}

// 【API 1】讀取排行榜
app.get('/api/leaderboard', (req, res) => {
    leaderboard.sort((a, b) => b.score - a.score);
    res.json(leaderboard.slice(0, 10)); 
});

// 【API 2】上傳新成績 (升級版：同名玩家只取最高分)
app.post('/api/score', (req, res) => {
    const newRecord = req.body;

    // 輸入驗證
    if (!newRecord || typeof newRecord.name !== 'string' || newRecord.name.trim().length === 0) {
        return res.status(400).json({ success: false, error: '請提供有效的玩家名稱' });
    }
    if (typeof newRecord.score !== 'number' || !Number.isInteger(newRecord.score) || newRecord.score < 0) {
        return res.status(400).json({ success: false, error: '請提供有效的整數分數' });
    }

    const name = newRecord.name.trim();
    const score = newRecord.score;

    // 1. 尋找資料庫中是否已經有同名的玩家？
    const existingPlayerIndex = leaderboard.findIndex(p => p.name === name);

    if (existingPlayerIndex !== -1) {
        // 2. 如果找到了同名玩家，檢查新分數有沒有「大於」舊分數
        if (score > leaderboard[existingPlayerIndex].score) {
            leaderboard[existingPlayerIndex].score = score; // 覆蓋成新高分
            console.log(`🎉 玩家 [${name}] 破紀錄了！更新為: ${score} 分`);
        } else {
            console.log(`😐 玩家 [${name}] 未突破個人最高分。`);
        }
    } else {
        // 3. 如果找不到同名玩家（新玩家），就直接新增一筆紀錄
        leaderboard.push({ name, score });
        console.log(`🎉 收到新玩家成績！玩家: ${name}, 答對: ${score} 題`);
    }

    // 🌟 將更新後的排行榜安全保存至硬碟
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(leaderboard, null, 2), 'utf-8');
        console.log("💾 排行榜已成功安全保存至硬碟！");
    } catch (e) {
        console.error("❌ 寫入排行榜檔案失敗", e);
    }

    res.json({ success: true });
});

// 全域 error handler
app.use((err, req, res, next) => {
    console.error("❌ 伺服器錯誤", err);
    res.status(500).json({ success: false, error: '伺服器內部錯誤' });
});

app.listen(port, () => {
  console.log(`🚀 全端麻將伺服器已啟動！連線至 http://localhost:${port}`);
});