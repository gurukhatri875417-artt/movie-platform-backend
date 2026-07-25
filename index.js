const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Enable CORS completely for all origins (Fixes browser blocks)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Increase JSON and URL-encoded body limit to 50mb (Fixes upload crashes)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. Simple test route to check if Render backend is awake
app.get('/', (req, res) => {
  res.status(200).send('Movie Platform Backend is Live and Running!');
});

// --- ADD YOUR DATABASE / MOVIE ROUTES BELOW THIS LINE ---

// Example:
// const movieRoutes = require('./routes/movieRoutes');
// app.use('/api/movies', movieRoutes);

// --------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
});