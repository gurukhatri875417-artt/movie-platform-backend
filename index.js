const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root welcome route
app.get('/', (req, res) => {
  res.send('Movie Platform Backend is running successfully!');
});

// Temporary /movies route so frontend works while you set up Prisma
app.get('/movies', (req, res) => {
  res.json([
    { id: 1, title: 'Inception' },
    { id: 2, title: 'Interstellar' },
    { id: 3, title: 'The Dark Knight' }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});