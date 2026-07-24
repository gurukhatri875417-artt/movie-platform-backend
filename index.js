const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test Database Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database!');
  release();
});

// GET: Fetch all movies
app.get('/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: 'Database error fetching movies' });
  }
});

// POST: Add a new movie
app.post('/movies', async (req, res) => {
  const { title, genre, thumbnailUrl, videoUrl, adminKey } = req.body;

  // Admin key check
  const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'streamflix123!';
  if (adminKey !== SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
  }

  if (!title || !videoUrl) {
    return res.status(400).json({ error: 'Title and Video URL are required' });
  }

  try {
    const query = `
      INSERT INTO movies (title, genre, thumbnailUrl, videoUrl)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [title, genre || 'General', thumbnailUrl, videoUrl];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Movie added successfully!', movie: result.rows[0] });
  } catch (err) {
    console.error('Error inserting movie:', err);
    res.status(500).json({ error: 'Failed to insert movie into database' });
  }
});

// DELETE: Remove a movie by ID
app.delete('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const { adminKey } = req.body;

  const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'streamflix123!';
  if (adminKey !== SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
  }

  try {
    const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ message: 'Movie deleted successfully!' });
  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});