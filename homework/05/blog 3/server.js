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
  secret: 'opencode-blog-secret-key-v3',
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
      --heart-color: #e74c3c;
      --transition-speed: 0.3s;
      --avatar-bg: #667eea;
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
      --heart-color: #f87171;
      --avatar-bg: #6c5ce7;
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
      text-decoration: none;
      font-weight: 500;
    }
    .nav-right .username:hover { color: var(--link-color); }
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
    .form-group textarea.comment-input {
      min-height: 60px;
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
    .btn-outline {
      background: transparent;
      border: 2px solid var(--link-color);
      color: var(--link-color);
    }
    .btn-outline:hover {
      background: var(--link-color);
      color: #fff;
    }
    .btn-heart {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.3rem;
      transition: transform 0.2s;
      color: var(--text-muted);
      padding: 4px 8px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .btn-heart:hover {
      transform: scale(1.2);
    }
    .btn-heart.liked {
      color: var(--heart-color);
    }
    .btn-heart .count {
      font-size: 0.85rem;
      font-weight: 600;
    }
    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--border);
      padding-bottom: 0;
    }
    .tab {
      padding: 10px 20px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-muted);
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
    }
    .tab:hover { color: var(--link-color); }
    .tab.active {
      color: var(--link-color);
      border-bottom-color: var(--link-color);
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
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .post-meta a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
    }
    .post-meta a:hover { color: var(--link-color); }
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
    .post-content th { background: var(--hover-bg); }
    .post-stats {
      display: flex;
      gap: 16px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .actions { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; }
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
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--avatar-bg);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .avatar-sm {
      width: 32px;
      height: 32px;
      font-size: 0.85rem;
    }
    .avatar-lg {
      width: 64px;
      height: 64px;
      font-size: 1.5rem;
    }
    .comment {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }
    .comment:last-child { border-bottom: none; }
    .comment-body { flex: 1; min-width: 0; }
    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }
    .comment-author {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-primary);
      text-decoration: none;
    }
    .comment-author:hover { color: var(--link-color); }
    .comment-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .comment-text {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-primary);
      margin-bottom: 6px;
    }
    .comment-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .comment-actions button,
    .comment-actions form button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.8rem;
      color: var(--text-muted);
      padding: 2px 6px;
      border-radius: 4px;
      transition: color 0.2s;
    }
    .comment-actions button:hover { color: var(--link-color); }
    .comment-actions .btn-heart-comment {
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .comment-actions .btn-heart-comment.liked { color: var(--heart-color); }
    .comment-actions .btn-heart-comment .count {
      font-size: 0.8rem;
    }
    .nested-replies {
      margin-left: 52px;
      padding-left: 16px;
      border-left: 3px solid var(--border);
    }
    .reply-form {
      margin-left: 52px;
      margin-top: 8px;
      margin-bottom: 12px;
    }
    .reply-form textarea {
      width: 100%;
      min-height: 50px;
      padding: 10px;
      border: 2px solid var(--border);
      border-radius: 8px;
      font-size: 0.9rem;
      background: var(--input-bg);
      color: var(--input-text);
      resize: vertical;
      transition: border-color 0.2s;
    }
    .reply-form textarea:focus {
      outline: none;
      border-color: var(--link-color);
    }
    .reply-form .btn {
      margin-top: 6px;
      padding: 6px 16px;
      font-size: 0.85rem;
    }
    .profile-header {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .profile-info { flex: 1; }
    .profile-info h1 { margin-bottom: 8px; }
    .profile-stats {
      display: flex;
      gap: 20px;
      margin: 12px 0;
    }
    .profile-stats span {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .profile-stats strong {
      color: var(--text-primary);
    }
    .profile-bio {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    .comment-section-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--text-primary);
    }
    @media (max-width: 600px) {
      .nav-inner { height: auto; padding: 12px 16px; flex-wrap: wrap; gap: 8px; }
      .nav-right { flex-wrap: wrap; gap: 10px; }
      .nav-right a { font-size: 0.9rem; }
      .card { padding: 20px; border-radius: 12px; }
      .card h1 { font-size: 1.4rem; }
      .post-item:hover { padding-left: 20px; }
      .nested-replies { margin-left: 20px; padding-left: 12px; }
      .reply-form { margin-left: 20px; }
      .profile-header { flex-direction: column; text-align: center; }
      .profile-stats { justify-content: center; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a href="/" class="logo">OpenCode 網誌</a>
      <div class="nav-right">
        ${user ? `<a href="/users/${user.id}" class="username">${user.username}</a><a href="/posts/new">寫新文章</a><a href="/logout">登出</a>` : `<a href="/login">登入</a><a href="/register">註冊</a>`}
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
      const btn = document.getElementById('themeToggle');
      if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    })();
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('blog-theme', next);
        this.textContent = next === 'dark' ? '☀️' : '🌙';
      });
    }
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

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function getAvatarHtml(username, size = '') {
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  return `<div class="avatar ${size}">${initial}</div>`;
}

function getLikeBtnHtml(targetType, targetId, liked, count, isAuth) {
  if (!isAuth) {
    return `<span class="btn-heart" title="登入後可按讚">♡ <span class="count">${count}</span></span>`;
  }
  const cls = liked ? 'btn-heart liked' : 'btn-heart';
  const icon = liked ? '♥' : '♡';
  return `<form method="post" action="/${targetType}s/${targetId}/like" style="display:inline;"><button type="submit" class="${cls}" title="${liked ? '取消讚' : '按讚'}">${icon} <span class="count">${count}</span></button></form>`;
}

app.get('/', async (req, res) => {
  const db = getDb();
  const user = req.session.userId;
  const tab = req.query.tab || 'all';

  let tabsHtml = '';
  let listHtml = '';

  if (user) {
    const allActive = tab === 'all' ? 'active' : '';
    const folActive = tab === 'following' ? 'active' : '';
    tabsHtml = `<div class="tabs"><a href="/?tab=all" class="tab ${allActive}">全部</a><a href="/?tab=following" class="tab ${folActive}">追蹤中</a></div>`;
  }

  if (user && tab === 'following') {
    const posts = db.exec(`SELECT p.*, u.username,
      (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as comment_count
      FROM posts p JOIN users u ON p.author_id = u.id
      WHERE p.is_public = 1 AND p.author_id IN (SELECT followed_id FROM follows WHERE follower_id = ?)
      ORDER BY p.created_at DESC`, [user]);
    const rows = posts.length > 0 ? posts[0].values : [];
    const cols = posts.length > 0 ? posts[0].columns : [];
    if (rows.length === 0) {
      listHtml = '<div class="empty"><p>追蹤中的人還沒有發表公開文章</p></div>';
    } else {
      listHtml = '<ul class="post-list">';
      for (const row of rows) {
        const idx = {}; cols.forEach((c, i) => idx[c] = i);
        const id = row[idx['id']]; const title = row[idx['title']]; const username = row[idx['username']];
        const createdAt = row[idx['created_at']]; const isPublic = row[idx['is_public']];
        const likeCount = row[idx['like_count']]; const commentCount = row[idx['comment_count']];
        const badge = isPublic ? '<span class="badge badge-public">公開</span>' : '<span class="badge badge-private">私人</span>';
        listHtml += `<li class="post-item"><h3><a href="/posts/${id}">${esc(title)}</a></h3><div class="post-meta">${badge}<a href="/users/${row[idx['author_id']]}">${esc(username)}</a><span>${createdAt}</span><span>♥ ${likeCount}</span><span>💬 ${commentCount}</span></div></li>`;
      }
      listHtml += '</ul>';
    }
  } else {
    let posts;
    if (user) {
      posts = db.exec(`SELECT p.*, u.username,
        (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as comment_count
        FROM posts p JOIN users u ON p.author_id = u.id
        WHERE p.is_public = 1 OR p.author_id = ? ORDER BY p.created_at DESC`, [user]);
    } else {
      posts = db.exec(`SELECT p.*, u.username,
        (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as comment_count
        FROM posts p JOIN users u ON p.author_id = u.id
        WHERE p.is_public = 1 ORDER BY p.created_at DESC`);
    }
    const rows = posts.length > 0 ? posts[0].values : [];
    const cols = posts.length > 0 ? posts[0].columns : [];
    if (rows.length === 0) {
      listHtml = '<div class="empty"><p>目前還沒有任何文章</p></div>';
    } else {
      listHtml = '<ul class="post-list">';
      for (const row of rows) {
        const idx = {}; cols.forEach((c, i) => idx[c] = i);
        const id = row[idx['id']]; const title = row[idx['title']]; const username = row[idx['username']];
        const createdAt = row[idx['created_at']]; const isPublic = row[idx['is_public']];
        const likeCount = row[idx['like_count']]; const commentCount = row[idx['comment_count']];
        const badge = isPublic ? '<span class="badge badge-public">公開</span>' : '<span class="badge badge-private">私人</span>';
        listHtml += `<li class="post-item"><h3><a href="/posts/${id}">${esc(title)}</a></h3><div class="post-meta">${badge}<a href="/users/${row[idx['author_id']]}">${esc(username)}</a><span>${createdAt}</span><span>♥ ${likeCount}</span><span>💬 ${commentCount}</span></div></li>`;
      }
      listHtml += '</ul>';
    }
  }

  const welcome = !user ? '<p style="margin-bottom:20px;color:var(--text-secondary);">歡迎來到 OpenCode 網誌，請<a href="/login" style="color:var(--link-color);">登入</a>或<a href="/register" style="color:var(--link-color);">註冊</a>以開始寫作。</p>' : '';
  const content = `<div class="card"><h1>📝 最新文章</h1>${welcome}${tabsHtml}${listHtml}</div>`;
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

function renderComments(postId, userId, db) {
  const result = db.exec(`SELECT c.*, u.username,
    (SELECT COUNT(*) FROM likes WHERE target_type='comment' AND target_id=c.id) as like_count,
    (SELECT COUNT(*) FROM likes WHERE target_type='comment' AND target_id=c.id AND user_id=?) as user_liked
    FROM comments c JOIN users u ON c.author_id = u.id
    WHERE c.post_id = ? ORDER BY c.created_at ASC`, [userId || -1, postId]);
  const rows = result.length > 0 ? result[0].values : [];
  const cols = result.length > 0 ? result[0].columns : [];

  const comments = [];
  for (const row of rows) {
    const idx = {}; cols.forEach((c, i) => idx[c] = i);
    comments.push({
      id: row[idx['id']],
      post_id: row[idx['post_id']],
      author_id: row[idx['author_id']],
      parent_id: row[idx['parent_id']],
      username: row[idx['username']],
      content: row[idx['content']],
      created_at: row[idx['created_at']],
      like_count: row[idx['like_count']],
      user_liked: row[idx['user_liked']],
    });
  }

  const topLevel = comments.filter(c => c.parent_id === null);
  const replyMap = {};
  for (const c of comments) {
    if (c.parent_id !== null) {
      if (!replyMap[c.parent_id]) replyMap[c.parent_id] = [];
      replyMap[c.parent_id].push(c);
    }
  }

  let html = '';
  for (const c of topLevel) {
    html += renderSingleComment(c, userId, replyMap);
  }
  return html;
}

function renderSingleComment(c, userId, replyMap) {
  const isAuth = !!userId;
  const isOwner = userId === c.author_id;
  const likeHtml = getLikeBtnHtml('comment', c.id, c.user_liked, c.like_count, isAuth);
  const replyForm = isAuth ? `<button class="reply-toggle" onclick="toggleReplyForm(${c.id})" style="background:none;border:none;cursor:pointer;font-size:0.8rem;color:var(--text-muted);">↩ 回覆</button>` : '';

  let html = `<div class="comment"><a href="/users/${c.author_id}">${getAvatarHtml(c.username, 'avatar-sm')}</a><div class="comment-body"><div class="comment-header"><a href="/users/${c.author_id}" class="comment-author">${esc(c.username)}</a><span class="comment-time">${c.created_at}</span></div><div class="comment-text">${esc(c.content)}</div><div class="comment-actions">${likeHtml}${replyForm}`;
  if (isOwner) {
    html += `<form method="post" action="/comments/${c.id}/delete" style="display:inline;" onsubmit="return confirm('確定刪除這則留言？')"><button type="submit">🗑 刪除</button></form>`;
  }
  html += `</div>`;

  if (isAuth) {
    html += `<div id="reply-form-${c.id}" class="reply-form" style="display:none;"><form method="post" action="/comments/${c.id}/reply"><textarea name="content" placeholder="寫下回覆..." required></textarea><button type="submit" class="btn btn-sm">回覆</button></form></div>`;
  }

  const replies = replyMap[c.id] || [];
  if (replies.length > 0) {
    html += `<div class="nested-replies">`;
    for (const r of replies) {
      html += renderReplyComment(r, userId);
    }
    html += `</div>`;
  }

  html += `</div></div>`;
  return html;
}

function renderReplyComment(c, userId) {
  const isAuth = !!userId;
  const isOwner = userId === c.author_id;
  const likeHtml = getLikeBtnHtml('comment', c.id, c.user_liked, c.like_count, isAuth);

  let html = `<div class="comment"><a href="/users/${c.author_id}">${getAvatarHtml(c.username, 'avatar-sm')}</a><div class="comment-body"><div class="comment-header"><a href="/users/${c.author_id}" class="comment-author">${esc(c.username)}</a><span class="comment-time">${c.created_at}</span></div><div class="comment-text">${esc(c.content)}</div><div class="comment-actions">${likeHtml}`;
  if (isOwner) {
    html += `<form method="post" action="/comments/${c.id}/delete" style="display:inline;" onsubmit="return confirm('確定刪除這則留言？')"><button type="submit">🗑 刪除</button></form>`;
  }
  html += `</div></div></div>`;
  return html;
}

app.get('/posts/:id', (req, res) => {
  const db = getDb();
  const userId = req.session.userId;
  const result = db.exec(`SELECT p.*, u.username,
    (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id) as like_count,
    (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id AND user_id=?) as user_liked
    FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?`, [userId || -1, req.params.id]);
  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(404).send(renderPage('找不到文章', '<div class="card"><h1>404</h1><p style="color:var(--text-secondary);">文章不存在</p><a href="/" class="btn btn-sm" style="margin-top:16px;">返回首頁</a></div>', req));
  }
  const cols = result[0].columns;
  const vals = result[0].values[0];
  const idx = {};
  cols.forEach((c, i) => idx[c] = i);
  const post = {
    id: vals[idx['id']], title: vals[idx['title']], content: vals[idx['content']],
    author_id: vals[idx['author_id']], username: vals[idx['username']],
    is_public: vals[idx['is_public']], created_at: vals[idx['created_at']],
    like_count: vals[idx['like_count']], user_liked: vals[idx['user_liked']],
  };
  if (!post.is_public && post.author_id !== userId) {
    return res.status(403).send(renderPage('無權限', '<div class="card"><h1>🔒 無權限</h1><p style="color:var(--text-secondary);">您沒有權限查看此文章</p><a href="/" class="btn btn-sm" style="margin-top:16px;">返回首頁</a></div>', req));
  }

  const htmlContent = marked.parse(post.content);
  const badge = post.is_public ? '<span class="badge badge-public">公開</span>' : '<span class="badge badge-private">私人</span>';

  const likeHtml = getLikeBtnHtml('post', post.id, post.user_liked, post.like_count, !!userId);

  let actions = '';
  if (userId === post.author_id) {
    actions = `<div class="actions"><form method="post" action="/posts/${post.id}/delete" onsubmit="return confirm('確定刪除這篇文章？')"><button type="submit" class="btn btn-danger btn-sm">刪除文章</button></form></div>`;
  }

  const commentForm = userId ? `<form method="post" action="/posts/${post.id}/comments"><div class="form-group"><textarea name="content" class="comment-input" placeholder="寫下留言..." required></textarea></div><button type="submit" class="btn btn-sm">送出留言</button></form>` : '<p style="color:var(--text-muted);"><a href="/login" style="color:var(--link-color);">登入</a>後即可留言</p>';

  const commentsHtml = renderComments(post.id, userId, db);
  const commentsSection = `<div class="card"><h2 class="comment-section-title">💬 留言</h2>${commentForm}<div style="margin-top:16px;">${commentsHtml || '<p style="color:var(--text-muted);">目前還沒有留言</p>'}</div></div>`;

  const content = `<div class="card"><h1>${esc(post.title)}</h1><div class="post-meta" style="margin-bottom:20px;">${badge}<a href="/users/${post.author_id}">${esc(post.username)}</a><span>${post.created_at}</span></div><div class="post-content">${htmlContent}</div><div class="post-stats">${likeHtml}</div>${actions}</div>${commentsSection}
  <script>
    function toggleReplyForm(id) {
      const form = document.getElementById('reply-form-' + id);
      if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
  </script>`;
  res.send(renderPage(post.title, content, req));
});

app.post('/posts/:id/delete', requireAuth, (req, res) => {
  const db = getDb();
  const result = db.exec(`SELECT author_id FROM posts WHERE id = ?`, [req.params.id]);
  if (result.length > 0 && result[0].values.length > 0) {
    const authorId = result[0].values[0][0];
    if (authorId === req.session.userId) {
      db.run(`DELETE FROM likes WHERE target_type='post' AND target_id=?`, [req.params.id]);
      const commentIds = db.exec(`SELECT id FROM comments WHERE post_id=?`, [req.params.id]);
      if (commentIds.length > 0) {
        for (const row of commentIds[0].values) {
          db.run(`DELETE FROM likes WHERE target_type='comment' AND target_id=?`, [row[0]]);
        }
      }
      db.run(`DELETE FROM comments WHERE post_id=?`, [req.params.id]);
      db.run(`DELETE FROM posts WHERE id=?`, [req.params.id]);
      saveDatabase();
    }
  }
  res.redirect('/');
});

app.post('/posts/:id/like', requireAuth, (req, res) => {
  const db = getDb();
  const userId = req.session.userId;
  const postId = req.params.id;
  const existing = db.exec(`SELECT id FROM likes WHERE user_id=? AND target_type='post' AND target_id=?`, [userId, postId]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    db.run(`DELETE FROM likes WHERE user_id=? AND target_type='post' AND target_id=?`, [userId, postId]);
  } else {
    db.run(`INSERT INTO likes (user_id, target_type, target_id) VALUES (?, 'post', ?)`, [userId, postId]);
  }
  saveDatabase();
  res.redirect(`/posts/${postId}`);
});

app.post('/posts/:id/comments', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    req.session.error = '留言內容不可為空';
    return res.redirect(`/posts/${req.params.id}`);
  }
  const db = getDb();
  db.run(`INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)`, [req.params.id, req.session.userId, content.trim()]);
  saveDatabase();
  res.redirect(`/posts/${req.params.id}`);
});

app.post('/comments/:id/reply', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    req.session.error = '回覆內容不可為空';
    const parentResult = db.exec(`SELECT post_id FROM comments WHERE id=?`, [req.params.id]);
    if (parentResult.length > 0 && parentResult[0].values.length > 0) {
      return res.redirect(`/posts/${parentResult[0].values[0][0]}`);
    }
    return res.redirect('/');
  }
  const db = getDb();
  const parentResult = db.exec(`SELECT post_id FROM comments WHERE id=?`, [req.params.id]);
  if (parentResult.length === 0 || parentResult[0].values.length === 0) {
    return res.redirect('/');
  }
  const postId = parentResult[0].values[0][0];
  db.run(`INSERT INTO comments (post_id, author_id, parent_id, content) VALUES (?, ?, ?, ?)`, [postId, req.session.userId, req.params.id, content.trim()]);
  saveDatabase();
  res.redirect(`/posts/${postId}`);
});

app.post('/comments/:id/like', requireAuth, (req, res) => {
  const db = getDb();
  const userId = req.session.userId;
  const commentId = req.params.id;
  const existing = db.exec(`SELECT id FROM likes WHERE user_id=? AND target_type='comment' AND target_id=?`, [userId, commentId]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    db.run(`DELETE FROM likes WHERE user_id=? AND target_type='comment' AND target_id=?`, [userId, commentId]);
  } else {
    db.run(`INSERT INTO likes (user_id, target_type, target_id) VALUES (?, 'comment', ?)`, [userId, commentId]);
  }
  saveDatabase();
  const postResult = db.exec(`SELECT post_id FROM comments WHERE id=?`, [commentId]);
  if (postResult.length > 0 && postResult[0].values.length > 0) {
    return res.redirect(`/posts/${postResult[0].values[0][0]}`);
  }
  res.redirect('/');
});

app.post('/comments/:id/delete', requireAuth, (req, res) => {
  const db = getDb();
  const result = db.exec(`SELECT c.* FROM comments c WHERE c.id=?`, [req.params.id]);
  if (result.length === 0 || result[0].values.length === 0) return res.redirect('/');
  const cols = result[0].columns;
  const vals = result[0].values[0];
  const idx = {};
  cols.forEach((c, i) => idx[c] = i);
  const authorId = vals[idx['author_id']];
  const postId = vals[idx['post_id']];
  if (authorId !== req.session.userId) return res.redirect(`/posts/${postId}`);
  db.run(`DELETE FROM likes WHERE target_type='comment' AND target_id=?`, [req.params.id]);
  db.run(`DELETE FROM comments WHERE parent_id=?`, [req.params.id]);
  db.run(`DELETE FROM comments WHERE id=?`, [req.params.id]);
  saveDatabase();
  res.redirect(`/posts/${postId}`);
});

app.get('/users/:id', (req, res) => {
  const db = getDb();
  const profileId = parseInt(req.params.id);
  const userId = req.session.userId;

  const userResult = db.exec(`SELECT u.*,
    (SELECT COUNT(*) FROM follows WHERE followed_id=u.id) as follower_count,
    (SELECT COUNT(*) FROM follows WHERE follower_id=u.id) as following_count,
    (SELECT COUNT(*) FROM posts WHERE author_id=u.id AND is_public=1) as post_count
    FROM users u WHERE u.id=?`, [profileId]);
  if (userResult.length === 0 || userResult[0].values.length === 0) {
    return res.status(404).send(renderPage('找不到使用者', '<div class="card"><h1>404</h1><p style="color:var(--text-secondary);">使用者不存在</p><a href="/" class="btn btn-sm" style="margin-top:16px;">返回首頁</a></div>', req));
  }
  const cols = userResult[0].columns;
  const vals = userResult[0].values[0];
  const idx = {};
  cols.forEach((c, i) => idx[c] = i);
  const profile = {
    id: vals[idx['id']], username: vals[idx['username']],
    created_at: vals[idx['created_at']],
    follower_count: vals[idx['follower_count']],
    following_count: vals[idx['following_count']],
    post_count: vals[idx['post_count']],
  };

  let followBtn = '';
  let isFollowing = false;
  if (userId && userId !== profileId) {
    const followResult = db.exec(`SELECT id FROM follows WHERE follower_id=? AND followed_id=?`, [userId, profileId]);
    isFollowing = followResult.length > 0 && followResult[0].values.length > 0;
    const btnText = isFollowing ? '取消追蹤' : '追蹤';
    const btnCls = isFollowing ? 'btn btn-sm btn-outline' : 'btn btn-sm';
    followBtn = `<form method="post" action="/users/${profileId}/follow" style="display:inline;"><button type="submit" class="${btnCls}">${btnText}</button></form>`;
  }

  const postsResult = db.exec(`SELECT p.*,
    (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id) as like_count,
    (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as comment_count
    FROM posts p WHERE p.author_id=? AND (p.is_public=1 OR ?=p.author_id)
    ORDER BY p.created_at DESC`, [profileId, userId || -1]);
  const postsRows = postsResult.length > 0 ? postsResult[0].values : [];
  const postsCols = postsResult.length > 0 ? postsResult[0].columns : [];

  let postsHtml = '';
  if (postsRows.length === 0) {
    postsHtml = '<div class="empty"><p>還沒有發表文章</p></div>';
  } else {
    postsHtml = '<ul class="post-list">';
    for (const row of postsRows) {
      const pidx = {}; postsCols.forEach((c, i) => pidx[c] = i);
      const id = row[pidx['id']]; const title = row[pidx['title']]; const isPublic = row[pidx['is_public']];
      const createdAt = row[pidx['created_at']]; const likeCount = row[pidx['like_count']]; const commentCount = row[pidx['comment_count']];
      const badge = isPublic ? '<span class="badge badge-public">公開</span>' : '<span class="badge badge-private">私人</span>';
      postsHtml += `<li class="post-item"><h3><a href="/posts/${id}">${esc(title)}</a></h3><div class="post-meta">${badge}<span>${createdAt}</span><span>♥ ${likeCount}</span><span>💬 ${commentCount}</span></div></li>`;
    }
    postsHtml += '</ul>';
  }

  const isOwn = userId === profileId;
  const content = `<div class="card"><div class="profile-header">${getAvatarHtml(profile.username, 'avatar-lg')}<div class="profile-info"><h1>${esc(profile.username)}</h1><div class="profile-stats"><span><strong>${profile.post_count}</strong> 篇文章</span><span><strong>${profile.follower_count}</strong> 位追蹤者</span><span><strong>${profile.following_count}</strong> 追蹤中</span></div><div class="profile-bio">${isOwn ? '這是您的個人檔案' : `${esc(profile.username)} 的個人檔案`}</div></div>${followBtn}</div></div><div class="card"><h2>📝 ${esc(profile.username)} 的文章</h2>${postsHtml}</div>`;
  res.send(renderPage(`${profile.username} 的個人檔案`, content, req));
});

app.post('/users/:id/follow', requireAuth, (req, res) => {
  const db = getDb();
  const followerId = req.session.userId;
  const followedId = parseInt(req.params.id);
  if (followerId === followedId) return res.redirect(`/users/${followedId}`);
  const existing = db.exec(`SELECT id FROM follows WHERE follower_id=? AND followed_id=?`, [followerId, followedId]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    db.run(`DELETE FROM follows WHERE follower_id=? AND followed_id=?`, [followerId, followedId]);
  } else {
    db.run(`INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)`, [followerId, followedId]);
  }
  saveDatabase();
  res.redirect(`/users/${followedId}`);
});

app.listen(PORT, async () => {
  await initDatabase();
  console.log(`Blog 3 伺服器啟動於 http://localhost:${PORT}`);
});
