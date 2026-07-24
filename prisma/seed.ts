import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleMovies = [
  {
    title: 'Tears of Steel',
    description: 'A futuristic sci-fi adventure exploring a world of advanced robotics and cybernetics in Amsterdam.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    genre: 'Sci-Fi',
    quality: '1080p Ultra HD'
  },
  {
    title: 'Sintel',
    description: 'A lonely young woman, Sintel, helps a wounded baby dragon and forms an unbreakable bond.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    genre: 'Fantasy',
    quality: '4K Ultra HD'
  },
  {
    title: 'Big Buck Bunny',
    description: 'A large and lovable rabbit deals with rude forest creatures in a comedy classic.',
    posterUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    genre: 'Animation',
    quality: '1080p Full HD'
  }
];

async function main() {
  console.log('?? Seeding database...');
  await prisma.movie.deleteMany();
  for (const movie of sampleMovies) {
    await prisma.movie.create({ data: movie });
  }
  console.log('? Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
