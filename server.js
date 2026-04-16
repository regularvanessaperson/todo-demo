const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your-secret-key'; // In production, use environment variable

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./todo.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    completed BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// Middleware to verify token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const hashedPassword = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) return res.status(400).json({ error: 'Username already exists' });
    res.status(201).json({ message: 'User registered' });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
    res.json({ token });
  });
});

app.post('/logout', authenticateToken, (req, res) => {
  // Since JWT is stateless, logout is handled on client side
  res.json({ message: 'Logged out successfully' });
});

app.get('/todos', authenticateToken, (req, res) => {
  db.all('SELECT * FROM todos WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.get('/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Todo not found' });
    res.json(row);
  });
});

app.post('/todos', authenticateToken, (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  db.run('INSERT INTO todos (user_id, title) VALUES (?, ?)', [req.user.id, title], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, title, completed: false });
  });
});

app.put('/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  let updateFields = [];
  let values = [];
  if (title !== undefined) {
    updateFields.push('title = ?');
    values.push(title);
  }
  if (completed !== undefined) {
    updateFields.push('completed = ?');
    values.push(completed ? 1 : 0);
  }
  if (updateFields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(id, req.user.id);
  db.run(`UPDATE todos SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`, values, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo updated' });
  });
});

app.delete('/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Todo deleted' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});