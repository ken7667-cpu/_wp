# 作業匯總：JavaScript 與網頁開發

## AI 使用聲明

本系列作業主要使用 AI 工具輔助開發，所有程式碼均為本人原創，無抄襲同學或網路他人之程式碼。

- **使用之 AI：** opencode CLI（big-pickle 模型）、Google Gemini
- **使用方式：** 透過 AI 協助程式碼審查、除錯、功能建議與文件撰寫
- **貢獻說明：**
  - **本人貢獻：** 整體架構設計、核心邏輯實作、功能規劃與測試
  - **AI 協助：** 程式碼審查、潛在問題提醒、部分內容生成與修改建議
- **參考來源：** 無。所有程式碼皆為自行撰寫，未直接複製他人或網路上的程式碼

---

## 目錄

1. [作業 02：HTML 表單](#作業-02-html-表單)
2. [作業 03：Hello JavaScript](#作業-03-hello-javascript)
3. [作業 04：10 個 JavaScript 程式練習](#作業-04-10-個-javascript-程式練習)
4. [作業 05：Express 部落格系統（四版本演化）](#作業-05-express-部落格系統四版本演化)
5. [作業 06：JavaScript 函數與參數練習](#作業-06-javascript-函數與參數練習)
6. [作業 07：全方位 JavaScript 實作挑戰](#作業-07-全方位-javascript-實作挑戰)
7. [Final Project：日麻極速聽牌挑戰賽](#final-project-日麻極速聽牌挑戰賽)

---

## 作業 02：HTML 表單

**檔案：** `homework/02/HTML`

一個社團報名表的 HTML 頁面，包含：
- 文字輸入（姓名、信箱、學號）
- 下拉選單（組別選擇）
- 單選按鈕（是否有程式基礎）
- 核取方塊（擅長語言）
- 日期選擇器、檔案上傳、顏色選擇器、文字區域

**技術重點：** HTML 表單元素、CSS 樣式設計（RWD 佈局、漸層、動畫）

---

## 作業 03：Hello JavaScript

**檔案：** `homework/03/hello.js`

最簡單的 JavaScript 入門：
```js
console.log('hello 你好')
```

**技術重點：** Node.js 基本執行、console.log 輸出

---

## 作業 04：10 個 JavaScript 程式練習

**目錄：** `homework/04/`

涵蓋 JS 核心觀念的 10 個練習題：

| 編號 | 主題 | 核心概念 |
|------|------|----------|
| 01 | 判斷奇偶數 | function、if/else |
| 02 | 陣列元素加總 | for 迴圈、陣列 |
| 03 | 尋找目標值 | while 迴圈 |
| 04 | 解析 JSON 資料 | JSON.parse |
| 05 | 篩選及格學生 | 陣列 + 物件 + 條件判斷 |
| 06 | 產生 JSON 報表 | JSON.stringify |
| 07 | 反轉陣列 | while 迴圈手動反轉 |
| 08 | 統計水果數量 | 物件鍵值對統計 |
| 09 | 計算購物車總價 | JSON 解析 + while 迴圈 |
| 10 | 找出最年長使用者 | 綜合運用（if/for/while/JSON/Array/Object） |

**技術重點：** function、if/else、for/while 迴圈、陣列操作、JSON 解析與序列化、物件操作

---

## 作業 05：Express 部落格系統（四版本演化）

**目錄：** `homework/05/`

從基礎到進階的四個版本演進：

### Blog 1（446 行）
- 用户註冊/登入/登出（bcrypt 加密）
- Markdown 文章 CRUD（marked 套件）
- 公開/私人文章權限控制
- SQLite 資料庫（sql.js）
- Express-session 會話管理

### Blog 2（609 行）
- 深色/淺色主題切換（CSS 變數 + localStorage）
- CSS 變數系統化重構
- 動畫效果（fadeIn）
- 主題切換按鈕動畫
- RWD 響應式設計強化

### Blog 3（1166 行）
- 留言系統（含巢狀回覆）
- 按讚功能（文章/留言）
- 用户個人檔案頁面
- 追蹤/取消追蹤功能
- 分頁標籤（全部/追蹤中）
- 頭像系統、XSS 防護（esc 函數）

### Blog 4（1361+ 行）
- 文章搜尋功能
- 文章編輯功能
- 帳號設定頁面（修改密碼/個人簡介）
- 個人簡介 bio 欄位

**技術重點：** Express.js、SQLite、session 管理、bcrypt 加密、RWD、暗色模式、留言系統、按讚功能、社交功能（追蹤）、搜尋功能

---

## 作業 06：JavaScript 函數與參數練習

**目錄：** `homework/06/`

| 編號 | 主題 | 核心概念 |
|------|------|----------|
| 01 | Callback 基礎 | 回呼函數作為參數 |
| 02 | IIFE | 立即執行函數與作用域 |
| 03 | 箭頭函數與 map | 陣列轉換 |
| 04 | 破壞性修改 | 陣列傳參考特性 |
| 05 | 高階函數 | 函數回傳函數（閉包） |
| 06 | Callback 篩選器 | 自製 filter |
| 07 | 箭頭函數與 filter | 篩選物件陣列 |
| 08 | 參數傳址陷阱 | 傳值 vs 傳參考 |
| 09 | 延遲 Callback | setTimeout |
| 10 | 綜合應用 | reduce + callback |

**技術重點：** callback、IIFE、箭頭函數、高階函數、閉包、傳值/傳參考、setTimeout

---

## 作業 07：全方位 JavaScript 實作挑戰

**目錄：** `homework/07/`

| 編號 | 主題 | 對應概念 |
|------|------|----------|
| ex01 | 物件屬性存取 | dot notation vs bracket notation |
| ex02 | 物件解構賦值 | const { title, content } = req.body |
| ex03 | 陣列遍歷與字串拼接 | forEach 產生文章列表 |
| ex04 | 字典與動態參數 | req.params.id |
| ex05 | Error-First Callback | 非同步設計模式 |
| ex06 | JSON 處理 | express.json() 中間件 |
| ex07 | 模擬資料庫查詢 | db.get(sql, params, callback) |
| ex08 | 樣板字串邏輯運算 | HTML 模板產生 |
| ex09 | 字串切片 | SQL substr 的 JS 對應 |
| ex10 | 錯誤優先回呼模式 | if (err) return ... |

**技術重點：** 物件操作、解構賦值、陣列遍歷、callback 模式、JSON 處理、資料庫查詢模擬、樣板字串

---

## Final Project：日麻極速聽牌挑戰賽

**目錄：** `homework/final-project/`

一個基於日本麻將（Riichi Mahjong）的聽牌練習網頁遊戲。

### 功能特色
- 34 張麻將鍵盤（Unicode 麻將圖示）
- 30 題豐富題庫（兩面聽、坎張、邊張、單騎、雙碰、三面聽、九蓮寶燈等）
- 3 分鐘限時挑戰
- 排行榜系統（同玩家只取最高分）
- JSON 檔案持久化儲存

### 技術棧
- 後端：Node.js + Express.js
- 前端：原生 HTML / CSS / JavaScript
- 儲存：JSON 檔案（leaderboard.json）

### API
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/leaderboard` | 取得排行榜前 10 名 |
| POST | `/api/score` | 上傳成績 |

**技術重點：** Express.js、前後端整合、遊戲邏輯設計、排行榜演算法、資料持久化

---

## 總結

這學期的作業涵蓋了從基礎 HTML/CSS 到完整全端網頁應用開發的各個面向：

| 作業 | 主要技術 | 程式碼行數 |
|------|----------|-----------|
| 02 | HTML/CSS | ~113 行 |
| 03 | Node.js 基本 | 1 行 |
| 04 | JavaScript 基礎 | ~130 行 |
| 05 | Express + SQLite 全端 | ~3000+ 行 |
| 06 | JS 進階函數 | ~200 行 |
| 07 | JS 實作挑戰 | ~360 行 |
| final-project | Express 全端遊戲 | ~3800+ 行 |

透過這些作業，完整練習了 HTML/CSS 切版、JavaScript 程式設計、Node.js 後端開發、資料庫操作、全端整合等核心技能。
