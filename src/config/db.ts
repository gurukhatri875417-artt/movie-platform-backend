import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

export const prisma = new PrismaClient();

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Error:', err));

export const connectDB = async () => {
  await prisma.$connect();
  await redisClient.connect();
  console.log('PostgreSQL and Redis Connected Successfully');
};
