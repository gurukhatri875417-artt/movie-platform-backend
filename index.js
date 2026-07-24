const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.send('Movie Platform API is Live!');
});

// Admin Web Form to Add Movies
app.get('/add-movie', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Add Movie</title>
      <style>
        body { font-family: sans-serif; padding: 40px; background: #141414; color: white; }
        .card { background: #1f1f1f; padding: 25px; border-radius: 8px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
        h2 { color: #e50914; margin-bottom: 15px; }
        input { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #333; background: #2a2a2a; color: white; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #e50914; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        button:hover { background: #f40612; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Add a New Movie</h2>
        <form onsubmit="event.preventDefault(); submitForm();">
          <input id="title" placeholder="Movie Title" required />
          <input id="videoUrl" placeholder="Video URL (.mp4)" required />
          <input id="thumbnailUrl" placeholder="Poster Image URL (.jpg / .png)" />
          <input id="genre" placeholder="Genre (e.g. Action, Drama)" />
          <button type="submit">Add Movie</button>
        </form>
      </div>
      <script>
        async function submitForm() {
          const title = document.getElementById('title').value;
          const videoUrl = document.getElementById('videoUrl').value;
          const thumbnailUrl = document.getElementById('thumbnailUrl').value;
          const genre = document.getElementById('genre').value;
          
          const res = await fetch('/movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, videoUrl, thumbnailUrl, genre })
          });
          
          if (res.ok) {
            alert('Movie added successfully!');
            window.location.href = '/movies';
          } else {
            alert('Failed to add movie');
          }
        }
      </script>
    </body>
    </html>
  `);
});

// GET all movies
app.get('/movies', async (req, res) => {
  try {
    const movies = await prisma.movie.findMany();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// POST a new movie
app.post('/movies', async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, genre } = req.body;
    const movie = await prisma.movie.create({
      data: { title, description, videoUrl, thumbnailUrl, genre }
    });
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create movie' });
  }
});

// User Auth Routes
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    res.status(400).json({ error: 'User registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.encode({ userId: user.id }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));