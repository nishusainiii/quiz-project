const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Load questions
const questions = JSON.parse(fs.readFileSync(path.join(__dirname, 'questions.json')));

app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: 'replace_this_with_a_secure_random_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
app.get('/api/questions', (req, res) => {
  const safe = questions.map(q => ({ id: q.id, q: q.q, options: q.options }));
  res.json({ questions: safe });
});

app.post('/api/answer', (req, res) => {
  const { questionId, selectedIndex } = req.body;
  const q = questions.find(x => x.id === Number(questionId));
  if (!q) return res.status(400).json({ error: 'Invalid question id' });

  if (!req.session.score) req.session.score = 0;
  if (!req.session.answered) req.session.answered = {};

  if (req.session.answered[questionId]) {
    return res.json({ alreadyAnswered: true, correct: q.correctIndex === selectedIndex, score: req.session.score });
  }

  const correct = (q.correctIndex === Number(selectedIndex));
  if (correct) req.session.score += 1;
  req.session.answered[questionId] = true;

  res.json({ correct, correctIndex: q.correctIndex, score: req.session.score });
});

app.get('/api/score', (req, res) => {
  res.json({ score: req.session.score || 0 });
});

app.post('/api/restart', (req, res) => {
  req.session.score = 0;
  req.session.answered = {};
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
