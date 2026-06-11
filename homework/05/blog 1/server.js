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
  secret: 'opencode-blog-secret-key',
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
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #333;
    }
    nav {
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 20px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
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
      color: #667eea;
      text-decoration: none;
    }
    .nav-links a {
      margin-left: 20px;
      text-decoration: none;
      color: #555;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: #667eea; }
    .nav-links .username {
      margin-left: 20px;
      color: #999;
      font-size: 0.9rem;
    }
    main {
      max-width: 960px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 30px rgba(0,0,0,0.1);
      padding: 30px;
      margin-bottom: 24px;
    }
    .card h1 {
      font-size: 1.8rem;
      margin-bottom: 20px;
      color: #333;
    }
    .card h2 {
      font-size: 1.3rem;
      margin-bottom: 15px;
      color: #444;
    }
    .form-group {
      margin-bottom: 18px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #555;
    }
    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    .form-group textarea {
      min-height: 200px;
      resize: vertical;
    }
    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
    }
    .form-group .checkbox-label {
      display: inline;
      font-weight: 400;
    }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102,126,234,0.4);
    }
    .btn-danger {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
    }
    .btn-danger:hover {
      box-shadow: 0 4px 15px rgba(231,76,60,0.4);
    }
    .btn-sm {
      padding: 8px 16px;
      font-size: 0.9rem;
    }
    .post-list { list-style: none; }
    .post-item {
      padding: 20px;
      border-bottom: 1px solid #eee;
      transition: background 0.2s;
    }
    .post-item:last-child { border-bottom: none; }
    .post-item:hover { background: #f8f9ff; }
    .post-item h3 {
      font-size: 1.2rem;
      margin-bottom: 8px;
    }
    .post-item h3 a {
      color: #333;
      text-decoration: none;
    }
    .post-item h3 a:hover { color: #667eea; }
    .post-meta {
      font-size: 0.85rem;
      color: #999;
    }
    .post-meta span { margin-right: 12px; }
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-public {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .badge-private {
      background: #fff3e0;
      color: #e65100;
    }
    .post-content {
      line-height: 1.8;
      font-size: 1.05rem;
    }
    .post-content h1, .post-content h2, .post-content h3 {
      margin: 20px 0 10px;
    }
    .post-content p { margin-bottom: 14px; }
    .post-content code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    .post-content pre {
      background: #f4f4f4;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 14px;
    }
    .post-content img { max-width: 100%; border-radius: 8px; }
    .post-content blockquote {
      border-left: 4px solid #667eea;
      padding-left: 16px;
      color: #666;
      margin-bottom: 14px;
    }
    .actions { margin-top: 20px; }
    .actions form { display: inline; }
    .empty {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    .flash {
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-weight: 500;
    }
    .flash-error {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ef9a9a;
    }
    .flash-success {
      background: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #a5d6a7;
    }
    @media (max-width: 600px) {
      .nav-inner { flex-direction: column; height: auto; padding: 10px 20px; }
      .nav-links { margin-top: 8px; }
      .nav-links a { margin: 0 8px; }
      .card { padding: 20px; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a href="/" class="logo">OpenCode 網誌</a>
      <div class="nav-links">
        ${user ? `<span class="username">${user.username}</span><a href="/posts/new">寫新文章</a><a href="/logout">登出</a>` : `<a href="/login">登入</a><a href="/register">註冊</a>`}
      </div>
    </div>
  </nav>
  <main>
    ${content}
  </main>
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
    listHtml = '<div class="empty"><p>目前還沒有任何文章</p></div>';
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

  const welcome = !user ? '<p style="margin-bottom:20px;color:#666;">歡迎來到 OpenCode 網誌，請<a href="/login" style="color:#667eea;">登入</a>或<a href="/register" style="color:#667eea;">註冊</a>以開始寫作。</p>' : '';
  const content = `<div class="card"><h1>最新文章</h1>${welcome}${listHtml}</div>`;
  res.send(renderPage('首頁', content, req));
});

app.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  const error = req.session.error || '';
  delete req.session.error;
  const content = `<div class="card"><h1>註冊</h1>${error ? `<div class="flash flash-error">${error}</div>` : ''}<form method="post" action="/register"><div class="form-group"><label>使用者名稱</label><input type="text" name="username" required></div><div class="form-group"><label>密碼</label><input type="password" name="password" required></div><button type="submit" class="btn">註冊</button></form><p style="margin-top:16px;color:#666;">已經有帳號？<a href="/login" style="color:#667eea;">登入</a></p></div>`;
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
  const content = `<div class="card"><h1>登入</h1>${error ? `<div class="flash flash-error">${error}</div>` : ''}${success ? `<div class="flash flash-success">${success}</div>` : ''}<form method="post" action="/login"><div class="form-group"><label>使用者名稱</label><input type="text" name="username" required></div><div class="form-group"><label>密碼</label><input type="password" name="password" required></div><button type="submit" class="btn">登入</button></form><p style="margin-top:16px;color:#666;">還沒有帳號？<a href="/register" style="color:#667eea;">註冊</a></p></div>`;
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
  const content = `<div class="card"><h1>寫新文章</h1><form method="post" action="/posts"><div class="form-group"><label>標題</label><input type="text" name="title" required></div><div class="form-group"><label>內容 (支援 Markdown)</label><textarea name="content" required placeholder="使用 Markdown 語法撰寫文章..."></textarea></div><div class="form-group"><input type="checkbox" name="is_public" id="is_public" value="1" checked><label for="is_public" class="checkbox-label">發布到公共貼文區</label></div><button type="submit" class="btn">發布文章</button></form></div>`;
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
    return res.status(404).send(renderPage('找不到文章', '<div class="card"><h1>404</h1><p>文章不存在</p><a href="/" class="btn btn-sm" style="margin-top:16px;">返回首頁</a></div>', req));
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
    return res.status(403).send(renderPage('無權限', '<div class="card"><h1>403</h1><p>您沒有權限查看此文章</p><a href="/" class="btn btn-sm" style="margin-top:16px;">返回首頁</a></div>', req));
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
  console.log(`Blog 1 伺服器啟動於 http://localhost:${PORT}`);
});
