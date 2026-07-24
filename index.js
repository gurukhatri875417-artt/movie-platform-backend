const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to PostgreSQL
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

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT Token
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

// Port Binding for Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});