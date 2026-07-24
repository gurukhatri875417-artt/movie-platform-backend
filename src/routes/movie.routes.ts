import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import http from 'http';
import https from 'https';

const router = Router();
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

router.get('/', async (req, res) => {
  try {
    const { search = '', genre = 'All' } = req.query;
    const cacheKey = `movies:search=${search}:genre=${genre}`;

    /* 1. Check Redis Cache */
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: JSON.parse(cachedData), source: 'redis' });
    }

    /* 2. Fallback to PostgreSQL */
    const where: any = {};
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (genre && typeof genre === 'string' && genre !== 'All') {
      where.genre = { equals: genre, mode: 'insensitive' };
    }

    const movies = await prisma.movie.findMany({ where, orderBy: { createdAt: 'desc' } });

    /* 3. Cache response in Redis for 60 seconds */
    await redis.setex(cacheKey, 60, JSON.stringify(movies));

    res.json({ success: true, data: movies, source: 'postgres' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch movies', error });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `movie:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached), source: 'redis' });

    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    await redis.setex(cacheKey, 300, JSON.stringify(movie));
    res.json({ success: true, data: movie, source: 'postgres' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching movie', error });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie || !movie.downloadUrl) return res.status(404).send('File not found');

    const sanitizedTitle = movie.title.replace(/[^a-zA-Z0-9]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');

    const client = movie.downloadUrl.startsWith('https') ? https : http;
    client.get(movie.downloadUrl, (stream) => { stream.pipe(res); });
  } catch (error) {
    res.status(500).send('Failed to download');
  }
});

export default router;
