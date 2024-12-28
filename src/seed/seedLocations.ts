import { DataSource } from 'typeorm';
import { Locations } from '../locations/entities/locations.entity'; 
import dotenv from 'dotenv';
import { UserFavoriteLocations } from '../locations/entities/userFavoriteLocations.entity'; // Import UserFavoriteLocations entity

// Load environment variables from .env file
dotenv.config();

// Initialize the data source
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // Get the database URL from the environment variable
  entities: [Locations, UserFavoriteLocations], // Only register the Locations entity here
  synchronize: true, // Automatically synchronize database schema (be cautious in production)
  logging: true, // Enable SQL logging for debugging
});

async function seed() {
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    // Create repository for Locations entity
    const locationRepository = AppDataSource.getRepository(Locations);

    // Sample locations to insert into the database
    const locations = [
      { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
      { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
      { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
    ];

    // Insert locations into the Locations table
    for (const location of locations) {
      const loc = locationRepository.create(location);
      await locationRepository.save(loc);
    }
    console.log('Locations have been seeded!');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    // Always close the connection after seeding
    await AppDataSource.destroy();
    console.log('Data Source has been closed!');
  }
}

// Run the seed function
seed();
