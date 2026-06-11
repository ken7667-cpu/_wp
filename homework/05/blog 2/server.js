const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const marked = require('marked');
const path = require('path');
const { initDatabase, saveDatabase, getDb } = require('./database');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'opencode-blog-secret-key-v2',
  resave: false,
  saveUninitialized: true,
}));

function renderPage(title, content, req) {
  const user = req.session.userId ? { id: req.session.userId, username: req.session.username } : null;
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - OpenCode 網誌</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      --card-bg: #fff;
      --card-shadow: 0 4px 30px rgba(0,0,0,0.1);
      --text-primary: #333;
      --text-secondary: #666;
      --text-muted: #999;
      --nav-bg: rgba(255,255,255,0.95);
      --nav-text: #555;
      --nav-shadow: 0 2px 20px rgba(0,0,0,0.1);
      --border: #e0e0e0;
      --hover-bg: #f8f9ff;
      --input-bg: #fff;
      --input-text: #333;
      --code-bg: #f4f4f4;
      --btn-gradient: linear-gradient(135deg, #667eea, #764ba2);
      --btn-shadow: rgba(102,126,234,0.4);
      --btn-danger: linear-gradient(135deg, #e74c3c, #c0392b);
      --btn-danger-shadow: rgba(231,76,60,0.4);
      --flash-error-bg: #ffebee;
      --flash-error-text: #c62828;
      --flash-error-border: #ef9a9a;
      --flash-success-bg: #e8f5e9;
      --flash-success-text: #2e7d32;
      --flash-success-border: #a5d6a7;
      --badge-public-bg: #e8f5e9;
      --badge-public-text: #2e7d32;
      --badge-private-bg: #fff3e0;
      --badge-private-text: #e65100;
      --link-color: #667eea;
      --transition-speed: 0.3s;
    }
    [data-theme="dark"] {
      --bg-gradient: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      --card-bg: #1e1e2f;
      --card-shadow: 0 4px 30px rgba(0,0,0,0.5);
      --text-primary: #e0e0e0;
      --text-secondary: #aaa;
      --text-muted: #777;
      --nav-bg: rgba(30,30,47,0.97);
      --nav-text: #ccc;
      --nav-shadow: 0 2px 20px rgba(0,0,0,0.4);
      --border: #333;
      --hover-bg: #2a2a3f;
      --input-bg: #2a2a3f;
      --input-text: #e0e0e0;
      --code-bg: #2a2a3f;
      --btn-gradient: linear-gradient(135deg, #6c5ce7, #a855f7);
      --btn-shadow: rgba(108,92,231,0.4);
      --btn-danger: linear-gradient(135deg, #ef4444, #dc2626);
      --btn-danger-shadow: rgba(239,68,68,0.4);
      --flash-error-bg: #3d1f1f;
      --flash-error-text: #fca5a5;
      --flash-error-border: #7f1d1d;
      --flash-success-bg: #1a3d1a;
      --flash-success-text: #86efac;
      --flash-success-border: #166534;
      --badge-public-bg: #1a3d1a;
      --badge-public-text: #86efac;
      --badge-private-bg: #3d2e1a;
      --badge-private-text: #fbbf24;
      --link-color: #a78bfa;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-gradient);
      min-height: 100vh;
      color: var(--text-primary);
      transition: background var(--transition-speed), color var(--transition-speed);
    }
    nav {
      background: var(--nav-bg);
      backdrop-filter: blur(10px);
      box-shadow: var(--nav-shadow);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background var(--transition-speed), box-shadow var(--transition-speed);
    }
    .nav-inner {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 20px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      font-size: 1.4rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .logo:hover { opacity: 0.8; }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .nav-right a {
      text-decoration: none;
      color: var(--nav-text);
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-right a:hover { color: var(--link-color); }
    .nav-right .username {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .theme-toggle {
      background: none;
      border: 2px solid var(--border);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      color: var(--text-primary);
    }
    .theme-toggle:hover {
      border-color: var(--link-color);
      transform: rotate(360deg);
    }
    main {
      max-width: 960px;
      margin: 40px auto;
      padding: 0 20px;
      animation: fadeIn 0.5s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .card {
      background: var(--card-bg);
      border-radius: 16px;
      box-shadow: var(--card-shadow);
      padding: 30px;
      margin-bottom: 24px;
      transition: all var(--transition-speed);
      animation: fadeIn 0.5s ease;
    }
    .card:hover {
      box-shadow: 0 8px 40px rgba(0,0,0,0.15);
    }
    [data-theme="dark"] .card:hover {
      box-shadow: 0 8px 40px rgba(0,0,0,0.4);
    }
    .card h1 {
      font-size: 1.8rem;
      margin-bottom: 20px;
      color: var(--text-primary);
    }
    .card h2 {
      font-size: 1.3rem;
      margin-bottom: 15px;
      color: var(--text-secondary);
    }
    .form-group {
      margin-bottom: 18px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--text-secondary);
    }
    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid var(--border);
      border-radius: 10px;
      font-size: 1rem;
      background: var(--input-bg);
      color: var(--input-text);
      transition: border-color 0.2s, background var(--transition-speed), color var(--transition-speed);
    }
    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--link-color);
    }
    .form-group textarea {
      min-height: 200px;
      resize: vertical;
    }
    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
      accent-color: #667eea;
    }
    .form-group .checkbox-label {
      display: inline;
      font-weight: 400;
      color: var(--text-primary);
    }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background: var(--btn-gradient);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
    }
    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px var(--btn-shadow);
    }
    .btn:active {
      transform: translateY(-1px);
    }
    .btn-danger {
      background: var(--btn-danger);
    }
    .btn-danger:hover {
      box-shadow: 0 6px 20px var(--btn-danger-shadow);
    }
    .btn-sm {
      padding: 8px 18px;
      font-size: 0.9rem;
    }
    .post-list { list-style: none; }
    .post-item {
      padding: 20px;
      border-bottom: 1px solid var(--border);
      transition: background 0.2s, padding-left 0.2s;
      border-radius: 8px;
      margin-bottom: 4px;
    }
    .post-item:last-child { border-bottom: none; margin-bottom: 0; }
    .post-item:hover {
      background: var(--hover-bg);
      padding-left: 28px;
    }
    .post-item h3 {
      font-size: 1.2rem;
      margin-bottom: 8px;
    }
    .post-item h3 a {
      color: var(--text-primary);
      text-decoration: none;
      transition: color 0.2s;
    }
    .post-item h3 a:hover { color: var(--link-color); }
    .post-meta {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .post-meta span { margin-right: 12px; }
    .badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      transition: background var(--transition-speed), color var(--transition-speed);
    }
    .badge-public {
      background: var(--badge-public-bg);
      color: var(--badge-public-text);
    }
    .badge-private {
      background: var(--badge-private-bg);
      color: var(--badge-private-text);
    }
    .post-content {
      line-height: 1.8;
      font-size: 1.05rem;
      color: var(--text-primary);
    }
    .post-content h1, .post-content h2, .post-content h3 {
      margin: 24px 0 12px;
      color: var(--text-primary);
    }
    .post-content p { margin-bottom: 16px; }
    .post-content a { color: var(--link-color); }
    .post-content code {
      background: var(--code-bg);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.9em;
      color: var(--text-primary);
    }
    .post-content pre {
      background: var(--code-bg);
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      margin-bottom: 16px;
      border: 1px solid var(--border);
    }
    .post-content img { max-width: 100%; border-radius: 12px; }
    .post-content blockquote {
      border-left: 4px solid var(--link-color);
      padding-left: 20px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }
    .post-content table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .post-content th, .post-content td {
      border: 1px solid var(--border);
      padding: 8px 12px;
      text-align: left;
    }
    .post-content th {
      background: var(--hover-bg);
    }
    .actions { margin-top: 24px; display: flex; gap: 12px; }
    .actions form { display: inline; }
    .empty {
      text-align: center;
      padding: 50px 20px;
      color: var(--text-muted);
    }
    .empty p { font-size: 1.1rem; }
    .flash {
      padding: 14px 22px;
      border-radius: 10px;
      margin-bottom: 20px;
      font-weight: 500;
      animation: fadeIn 0.3s ease;
    }
    .flash-error {
      background: var(--flash-error-bg);
      color: var(--flash-error-text);
      border: 1px solid var(--flash-error-border);
    }
    .flash-success {
      background: var(--flash-success-bg);
      color: var(--flash-success-text);
      border: 1px solid var(--flash-success-border);
    }
    .footer-text {
      text-align: center;
      padding: 20px;
      color: rgba(255,255,255,0.6);
      font-size: 0.85rem;
    }
    @media (max-width: 600px) {
      .nav-inner { height: auto; padding: 12px 16px; flex-wrap: wrap; gap: 8px; }
      .nav-right { flex-wrap: wrap; gap: 10px; }
      .nav-right a { font-size: 0.9rem; }
      .card { padding: 20px; border-radius: 12px; }
      .card h1 { font-size: 1.4rem; }
      .post-item:hover { padding-left: 20px; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a href="/" class="logo">OpenCode 網誌</a>
      <div class="nav-right">
        ${user ? `<span class="username">${user.username}</span><a href="/posts/new">寫新文章</a><a href="/logout">登出</a>` : `<a href="/login">登入</a><a href="/register">註冊</a>`}
        <button class="theme-toggle" id="themeToggle" aria-label="切換主題">🌙</button>
      </div>
    </div>
  </nav>
  <main>
    ${content}
  </main>
  <div class="footer-text">OpenCode 網誌 &copy; ${new Date().getFullYear()}</div>
  <script>
    (function() {
      const saved = localStorage.getItem('blog-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = saved || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
      document.getElementById('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
    })();
    document.getElementById('themeToggle').addEventListener('click', function() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('blog-theme', next);
      this.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  </script>
</body>
</html>`;
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.error = '請先登入';
    return res.redirect('/login');
  }
  next();
}

app.get('/', async (req, res) => {
  const db = getDb();
  const user = req.session.userId;
  let posts;
  if (user) {
    posts = db.exec(`SELECT p.*, u.username FROM posts p JOIN users u ON p.author_id = u.id WHERE p.is_public = 1 OR p.author_id = ? ORDER BY p.created_at DESC`, [user]);
  } else {
    posts = db.exec(`SELECT p.*, u.username FROM posts p JOIN users u ON p.author_id = u.id WHERE p.is_public = 1 ORDER BY p.created_at DESC`);
  }
  const rows = posts.length > 0 ? posts[0].values : [];
  const columns = posts.length > 0 ? posts[0].columns : [];

  let listHtml = '';
  if (rows.length === 0) {
    listHtml = '<div class="empty"><p>目前還沒有任何文章</p><p style="margin-top:8px;font-size:0.9rem;">成為第一位發表文章的人吧！</p></div>';
  } else {
    listHtml = '<ul class="post-list">';
    for (const row of rows) {
      const idx = {};
      columns.forEach((c, i) => idx[c] = i);
      const id = row[idx['id']];
      const title = row[idx['title']];
      const username = row[idx['username']];
      const createdAt = row[idx['created_at']];
      const isPublic = row[idx['is_public']];
      const badge = isPublic ? '<span class="badge badge-public">公開</span>' : '<span class="badge badge-private">私人</span>';
      listHtml += `<li class="post-item"><h3><a href="/posts/${id}">${title}</a></h3><div class="post-meta">${badge}<span>作者：${username}</span><span>${createdAt}</span></div></li>`;
    }
    listHtml += '</ul>';
  }

  const welcome = !user ? '<p style="margin-bottom:20px;color:var(--text-secondary);">歡迎來到 OpenCode 網誌，請<a href="/login" style="color:var(--link-color);">登入</a>或<a href="/register" style="color:var(--link-color);">註冊</a>以開始寫作。</p>' : '';
  const content = `<div class="card"><h1>📝 最新文章</h1>${welcome}${listHtml}</div>`;
  res.send(renderPage('首頁', content, req));
});

app.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  const error = req.session.error || '';
  delete req.session.error;
  const content = `<div class="card"><h1>📝 註冊</h1>${error ? `<div class="flash flash-error">${error}</div>` : ''}<form method="post" action="/register"><div class="form-group"><label>使用者名稱</label><input type="text" name="username" required></div><div class="form-group"><label>密碼</label><input type="password" name="password" required></div><button type="submit" class="btn">註冊</button></form><p style="margin-top:16px;color:var(--text-secondary);">已經有帳號？<a href="/login" style="color:var(--link-color);">登入</a></p></div>`;
  res.send(renderPage('註冊', content, req));
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    req.session.error = '請填寫所有欄位';
    return res.redirect('/register');
  }
  const db = getDb();
  const existing = db.exec(`SELECT id FROM users WHERE username = ?`, [username]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    req.session.error = '使用者名稱已存在';
    return res.redirect('/register');
  }
  const hashed = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashed]);
  saveDatabase();
  req.session.success = '註冊成功，請登入';
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  const error = req.session.error || '';
  const success = req.session.success || '';
  delete req.session.error;
  delete req.session.success;
  const content = `<div class="card"><h1>🔐 登入</h1>${error ? `<div class="flash flash-error">${error}</div>` : ''}${success ? `<div class="flash flash-success">${success}</div>` : ''}<form method="post" action="/login"><div class="form-group"><label>使用者名稱</label><input type="text" name="username" required></div><div class="form-group"><label>密碼</label><input type="password" name="password" required></div><button type="submit" class="btn">登入</button></form><p style="margin-top:16px;color:var(--text-secondary);">還沒有帳號？<a href="/register" style="color:var(--link-color);">註冊</a></p></div>`;
  res.send(renderPage('登入', content, req));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    req.session.error = '請填寫所有欄位';
    return res.redirect('/login');
  }
  const db = getDb();
  const result = db.exec(`SELECT * FROM users WHERE username = ?`, [username]);
  if (result.length === 0 || result[0].values.length === 0) {
    req.session.error = '使用者名稱或密碼錯誤';
    return res.redirect('/login');
  }
  const cols = result[0].columns;
  const vals = result[0].values[0];
  const idx = {};
  cols.forEach((c, i) => idx[c] = i);
  const user = { id: vals[idx['id']], username: vals[idx['username']], password: vals[idx['password']] };
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    req.session.error = '使用者名稱或密碼錯誤';
    return res.redirect('/login');
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/posts/new', requireAuth, (req, res) => {
  const content = `<div class="card"><h1>✏️ 寫新文章</h1><form method="post" action="/posts"><div class="form-group"><label>標題</label><input type="text" name="title" required placeholder="輸入文章標題..."></div><div class="form-group"><label>內容 (支援 Markdown)</label><textarea name="content" required placeholder="使用 Markdown 語法撰寫文章..."></textarea></div><div class="form-group"><input type="checkbox" name="is_public" id="is_public" value="1" checked><label for="is_public" class="checkbox-label">發布到公共貼文區</label></div><button type="submit" class="btn">發布文章</button></form></div>`;
  res.send(renderPage('寫新文章', content, req));
});

app.post('/posts', requireAuth, (req, res) => {
  const { title, content } = req.body;
  const isPublic = req.body.is_public ? 1 : 0;
  if (!title || !content) {
    req.session.error = '請填寫所有欄位';
    return res.redirect('/posts/new');
  }
  const db = getDb();
  db.run(`INSERT INTO posts (title, content, author_id, is_public) VALUES (?, ?, ?, ?)`, [title, content, req.session.userId, isPublic]);
  saveDatabase();
  res.redirect('/');
});

app.get('/posts/:id', (req, res) => {
  const db = getDb();
  const result = db.exec(`SELECT p.*, u.username FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?`, [req.params.id]);
  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(404).send(renderPage('找不到文章', '<div class="card"><h1>404</h1><p style="color:var(--text-secondary);">文章不存在</p><a href="/" class="btn btn-sm" style="margin-top:16px;">返回首頁</a></div>', req));
  }
  const cols = result[0].columns;
  const vals = result[0].values[0];
  const idx = {};
  cols.forEach((c, i) => idx[c] = i);
  const post = {
    id: vals[idx['id']],
    title: vals[idx['title']],
    content: vals[idx['content']],
    author_id: vals[idx['author_id']],
    username: vals[idx['username']],
    is_public: vals[idx['is_public']],
    created_at: vals[idx['created_at']],
  };
  if (!post.is_public && post.author_id !== req.session.userId) {
    return res.status(403).send(renderPage('無權限', '<div class="card"><h1>🔒 無權限</h1><p style="color:var(--text-secondary);">您沒有權限查看此文章</p><a href="/" class="btn btn-sm" style="margin-top:16px;">返回首頁</a></div>', req));
  }
  const htmlContent = marked.parse(post.content);
  const badge = post.is_public ? '<span class="badge badge-public">公開</span>' : '<span class="badge badge-private">私人</span>';
  let actions = '';
  if (req.session.userId === post.author_id) {
    actions = `<div class="actions"><form method="post" action="/posts/${post.id}/delete" onsubmit="return confirm('確定刪除這篇文章？')"><button type="submit" class="btn btn-danger btn-sm">刪除文章</button></form></div>`;
  }
  const content = `<div class="card"><h1>${post.title}</h1><div class="post-meta" style="margin-bottom:20px;">${badge}<span>作者：${post.username}</span><span>${post.created_at}</span></div><div class="post-content">${htmlContent}</div>${actions}</div>`;
  res.send(renderPage(post.title, content, req));
});

app.post('/posts/:id/delete', requireAuth, (req, res) => {
  const db = getDb();
  const result = db.exec(`SELECT author_id FROM posts WHERE id = ?`, [req.params.id]);
  if (result.length > 0 && result[0].values.length > 0) {
    const authorId = result[0].values[0][0];
    if (authorId === req.session.userId) {
      db.run(`DELETE FROM posts WHERE id = ?`, [req.params.id]);
      saveDatabase();
    }
  }
  res.redirect('/');
});

app.listen(PORT, async () => {
  await initDatabase();
  console.log(`Blog 2 伺服器啟動於 http://localhost:${PORT}`);
});
