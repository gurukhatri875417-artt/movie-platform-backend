const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

let moviesDatabase = [];

app.get('/', (req, res) => {
  res.status(200).send('Movie Platform Backend is Live and Running!');
});

app.post('/api/movies', (req, res) => {
  try {
    const movieData = req.body;
    moviesDatabase.push(movieData);
    console.log("Movie uploaded:", movieData);
    return res.status(200).json({ success: true, message: "Movie uploaded successfully!", data: movieData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/movies', (req, res) => {
  res.status(200).json(moviesDatabase);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});