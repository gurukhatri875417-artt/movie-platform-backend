import { Router, Request, Response } from 'express';
import Movie from '../models/Movie';

const router = Router();

// GET all movies
router.get('/', async (req: Request, res: Response) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// GET single movie by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// POST new movie (Updated to accept download links)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      posterUrl, 
      videoUrl, 
      downloadUrl720p, 
      downloadUrl1080p 
    } = req.body;

    const newMovie = new Movie({
      title,
      posterUrl,
      videoUrl,
      downloadUrl720p: downloadUrl720p || '',
      downloadUrl1080p: downloadUrl1080p || '',
    });

    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    console.error('Error saving movie:', error);
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

export default router;