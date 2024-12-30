import { DataSource } from 'typeorm';
import { Locations } from '../locations/entity/locations.entity'; 
import dotenv from 'dotenv';
import { UserFavoriteLocations } from '../locations/entity/userFavoriteLocations.entity';

// Load environment variables from .env file
dotenv.config();

// Initialize the data source
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Locations, UserFavoriteLocations],
  synchronize: true,
  logging: true, 
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const locationRepository = AppDataSource.getRepository(Locations);

    const locations = [
      { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
      { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
      { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
    ];

    for (const location of locations) {
      const loc = locationRepository.create(location);
      await locationRepository.save(loc);
    }
    console.log('Locations have been seeded!');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Data Source has been closed!');
  }
}

// Run the seed function
seed();
