import { Request, Response } from 'express';
import { prisma, redisClient } from '../config/db';

export const getMovies = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const genre = (req.query.genre as string) || '';
    const skip = (page - 1) * limit;
    const cacheKey = `movies:page:${page}:limit:${limit}:search:${search}:genre:${genre}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const whereClause: any = {};
    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }
    if (genre) {
      whereClause.genres = { has: genre };
    }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where: whereClause,
        include: { links: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.movie.count({ where: whereClause }),
    ]);

    const response = {
      data: movies,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getMovieBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const cacheKey = `movie:${slug}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      prisma.movie.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {});
      return res.json(JSON.parse(cachedData));
    }

    const movie = await prisma.movie.findUnique({
      where: { slug },
      include: { links: true },
    });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await prisma.movie.update({ where: { slug }, data: { views: { increment: 1 } } });
    await redisClient.setEx(cacheKey, 600, JSON.stringify(movie));
    return res.json(movie);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};
