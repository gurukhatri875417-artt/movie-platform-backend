const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// 1. Root Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).send('API is live!');
});

// 2. User Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User created successfully', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. User Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get All Users Route
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, createdAt: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get All Movies Route
app.get('/movies', async (req, res) => {
  try {
    const movies = await prisma.movie.findMany();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Get Single Movie by ID Route
app.get('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({ where: { id } });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Create a New Movie Route
app.post('/movies', async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, genre } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'Title and videoUrl are required' });
    }

    const movie = await prisma.movie.create({
      data: { title, description, videoUrl, thumbnailUrl, genre },
    });

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Add-Movie Web Form Route
app.get('/add-movie', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Add Movie</title>
      <style>
        body { font-family: sans-serif; padding: 40px; background: #f4f4f9; }
        .card { background: white; padding: 20px; border-radius: 8px; max-width: 400px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        input { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Add a New Movie</h2>
        <form onsubmit="event.preventDefault(); submitForm();">
          <input id="title" placeholder="Movie Title" required />
          <input id="videoUrl" placeholder="Video URL (.mp4)" required />
          <input id="genre" placeholder="Genre (e.g. Action, Drama)" />
          <button type="submit">Add Movie</button>
        </form>
      </div>
      <script>
        async function submitForm() {
          const title = document.getElementById('title').value;
          const videoUrl = document.getElementById('videoUrl').value;
          const genre = document.getElementById('genre').value;
          
          const res = await fetch('/movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, videoUrl, genre })
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

// Port Binding for Render Deployment
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});