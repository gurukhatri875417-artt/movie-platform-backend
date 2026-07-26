const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory storage for movies
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

// POST: Upload a new movie (ultra-permissive to completely prevent 400 errors)
app.post(['/movies', '/api/movies'], (req, res) => {
  try {
    console.log("Incoming request body:", req.body);

    const title = req.body.title || req.body.name || "Untitled Movie";
    const poster = req.body.poster || req.body.image || "";
    const videoUrl = req.body.videoUrl || req.body.url || "";

    const newMovie = { 
      title, 
      poster, 
      videoUrl, 
      createdAt: new Date() 
    };

    moviesDatabase.push(newMovie);

    console.log("Successfully saved movie:", newMovie);
    return res.status(200).json({ 
      success: true, 
      message: 'Movie uploaded successfully!', 
      data: newMovie 
    });
  } catch (error) {
    console.error("Server catch error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});