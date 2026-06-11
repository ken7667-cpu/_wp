# 全方位 JavaScript 實作挑戰：從基礎到後端邏輯

這份練習題是為 Express 部落格範例程式所設計，共 10 題。完成後將能理解「資料如何從資料庫流向網頁」、「物件如何解構」以及「非同步 Callback 的運作邏輯」。

## 題目列表

| 編號 | 主題 | 對應概念 |
|------|------|----------|
| ex01 | 物件屬性存取 | `post.title` vs `post["title"]` |
| ex02 | 物件解構賦值 | `const { title, content } = req.body` |
| ex03 | 陣列遍歷與字串拼接 | `posts.forEach` 產生文章列表 |
| ex04 | 字典與動態參數 | `req.params.id` 的來源 |
| ex05 | Error-First Callback | `getPost(id, callback)` 非同步設計 |
| ex06 | JSON 處理 | `app.use(express.json())` 在解析什麼 |
| ex07 | 模擬資料庫查詢 | `db.get(sql, params, callback)` 結構 |
| ex08 | 樣板字串邏輯運算 | 網頁 HTML 模板產生 |
| ex09 | 字串切片 | SQL `substr` 的 JS 對應 |
| ex10 | 錯誤優先回呼模式 | `if (err) return ...` 的由來 |

## 使用方式

```bash
node ex01.js
node ex02.js
# ...依此類推
```

## 與部落格程式的對照

- **ex10** → 所有 `db.xxx` 的 `(err, row) => { ... }` 結構
- **ex02** → `app.post('/posts')` 內取出表單資料
- **ex03** → 首頁 `posts.forEach` 產生文章列表
- **ex08** → 整個 `let html = ...` 動態網頁產生過程
