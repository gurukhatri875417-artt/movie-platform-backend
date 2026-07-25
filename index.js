const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Temporary in-memory storage for movies (or hook up your Prisma database here)
let moviesDatabase = [];

// Base route to check if backend is running
app.get('/', (req, res) => {
  res.status(200).send('Movie Platform Backend is Live and Running!');
});

// GET: Fetch movies list (supports both /movies and /api/movies)
app.get(['/movies', '/api/movies'], (req, res) => {
  try {
    res.status(200).json(moviesDatabase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Upload a new movie (supports both /movies and /api/movies)
app.post(['/movies', '/api/movies'], (req, res) => {
  try {
    const { title, poster, videoUrl } = req.body;

    if (!title || !poster || !videoUrl) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const newMovie = { title, poster, videoUrl, createdAt: new Date() };
    moviesDatabase.push(newMovie);

    console.log("Movie uploaded successfully:", newMovie);
    return res.status(200).json({ success: true, message: 'Movie uploaded successfully!', data: newMovie });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});