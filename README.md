<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest



# Weather App API

A comprehensive weather application built with NestJS, providing current weather and forecast data with user authentication and location management features. The application supports both REST and GraphQL APIs for weather data access. Swagger documentation is available at `/api-doc`. Additionally, the system includes a background job that regularly updates weather data for users' favorite locations.

## Features

- **Authentication**: Secure JWT-based authentication system
- **Weather Data**: Current weather and forecast endpoints
- **Location Management**: Save and manage favorite locations
- **Rate Limiting**: API request rate limiting
- **Caching**: Redis-based caching for improved performance
- **Testing**: Comprehensive unit and e2e tests
- **Data Seeding**: Pre-populated city data available through seed script for consistent testing and development

## System Design

### Design Algorithm
- **Dependency Injection**: Core NestJS feature for managing component dependencies
- **Singleton Pattern**: Services are instantiated once and shared across the application
- **Decorator Pattern**: Extensive use of decorators for metadata and configuration
- **Module Pattern**: Application organized into feature modules for better separation of concerns
- **Layered Architecture**: Separation of concerns with controllers, services, and repositories

### Rate Limiting Algorithm
- **Token Bucket Algorithm**: Used for rate limiting with Redis as the storage backend
- **Configurable Limits**: Rate limits can be configured per endpoint
- **Distributed Rate Limiting**: Consistent rate limiting across multiple instances

### Caching Algorithm
- **Time-to-Live (TTL)**: Configurable expiration for cached data
- **Cache Invalidation**: Automatic invalidation on data updates

## Third-Party APIs

- **Tomorrow API**: Used for fetching current(realtime) weather and forecast data
  - **Endpoint Used**
    - Forcast Weather Api :- https://docs.tomorrow.io/reference/weather-forecast
    - Current Weather Api :- https://api.tomorrow.io/v4/weather/realtime
  - **Documentation**: https://docs.tomorrow.io/


## Project Structure

```
.
├── .eslintrc.js                # ESLint configuration
├── .gitignore                  # Specifies intentionally untracked files to ignore
├── .prettierrc                 # Prettier configuration for code formatting
├── jest-e2e.json               # Jest configuration for end-to-end tests
├── nest-cli.json               # NestJS CLI configuration
├── package-lock.json           # Automatically generated package lock file
├── package.json                # Project dependencies and scripts
├── README.md                   # Project documentation
├── tsconfig.build.json         # TypeScript configuration for build
├── tsconfig.json               # TypeScript configuration
├── src/
│   ├── app.module.ts           # Root application module
│   ├── http-exception.filter.ts # Global exception filter for handling errors
│   ├── logger.service.ts       # Logger service with rotation and file management
│   ├── main.ts                 # Application entry point, handles cron jobs and server
│   ├── schema.gql              # GraphQL schema definition
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts  # Authentication controller
│   │   ├── auth.guard.ts       # Authentication guard for protected routes
│   │   ├── auth.module.ts      # Authentication module definition
│   │   ├── auth.service.ts     # Authentication service implementation
│   │   ├── dto/
│   │   │   └── login.dto.ts    # Data transfer object for login
│   ├── cache/                  # Caching module
│   │   └── redis.config.ts     # Redis cache configuration
│   ├── locations/              # Location management module
│   │   ├── locations.controller.ts # Location controller
│   │   ├── locations.module.ts # Location module definition
│   │   ├── locations.service.ts # Location service implementation
│   │   ├── dto/
│   │   │   ├── locations.dto.ts # DTO for location data
│   │   │   └── userFavoriteLocations.dto.ts # DTO for user favorite locations
│   │   ├── entity/
│   │   │   ├── locations.entity.ts # Location entity definition
│   │   │   └── userFavoriteLocations.entity.ts # User favorite locations entity
│   ├── rateLimit/              # Rate limiting module
│   │   ├── rateLimit.decorator.ts # Rate limit decorator
│   │   ├── rateLimit.guard.ts  # Rate limit guard implementation
│   │   └── rateLimit.service.ts # Rate limit service
│   ├── seed/                   # Data seeding module
│   │   └── seedLocations.ts    # Script to seed initial location data
│   ├── users/                  # User management module
│   │   ├── user.decorator.ts   # User decorator for request context
│   │   ├── users.controller.ts # User controller
│   │   ├── users.module.ts     # User module definition
│   │   ├── users.service.ts    # User service implementation
│   │   ├── dto/
│   │   │   └── users.dto.ts    # DTO for user data
│   │   ├── entity/
│   │   │   └── users.entity.ts # User entity definition
│   ├── weather/                # Weather data module
│   │   ├── weather.constants.ts # Weather-related constants
│   │   ├── weather.controller.ts # Weather controller
│   │   ├── weather.module.ts   # Weather module definition
│   │   ├── weather.resolver.ts # GraphQL resolver for weather data
│   │   ├── weather.service.ts  # Weather service implementation
│   │   ├── dto/
│   │   │   ├── currentWeather.dto.ts # DTO for current weather data
│   │   │   └── weatherForecast.dto.ts # DTO for weather forecast data
│   │   ├── entity/
│   │   │   ├── currentWeather.entity.ts # Current weather entity
│   │   │   └── weatherForecast.entity.ts # Weather forecast entity
├── test/                       # Test files
│   ├── auth/                   # Authentication tests
│   │   ├── auth.controller.spec.ts # Controller tests
│   │   ├── auth.guard.spec.ts  # Guard tests
│   │   ├── auth.service.spec.ts # Service tests
│   ├── locations/              # Location management tests
│   │   ├── locations.controller.spec.ts # Controller tests
│   │   ├── locations.service.spec.ts # Service tests
│   ├── weather/                # Weather data tests
│   │   ├── weather.controller.spec.ts # Controller tests
│   │   ├── weather.resolver.spec.ts # GraphQL resolver tests
│   │   ├── weather.service.spec.ts # Service tests
```


## Error Handling

The application uses a global exception filter (`http-exception.filter.ts`) to handle errors consistently. Here's how different types of errors are handled:

1. **Validation Errors**:
   - Automatically handled by class-validator
   - Returns 400 Bad Request with detailed error messages
   - Example response:
     ```json
     {
       "statusCode": 400,
       "message": [
         "email must be a valid email address",
         "password must be at least 8 characters"
       ],
       "error": "Bad Request"
     }
     ```

2. **404 Not Found**:
   - Handled by NestJS built-in exception filter
   - Returns 404 status with a generic message
   - Example response:
     ```json
     {
       "statusCode": 404,
       "message": "Cannot GET /nonexistent-endpoint",
       "error": "Not Found"
     }
     ```

3. **Authentication Errors**:
   - Returns 401 Unauthorized for invalid credentials
   - Returns 403 Forbidden for unauthorized access attempts
   - Example response:
     ```json
     {
       "statusCode": 401,
       "message": "Unauthorized",
       "error": "Unauthorized"
     }
     ```

4. **Rate Limiting Errors**:
   - Returns 429 Too Many Requests when rate limit is exceeded
   - Includes Retry-After header indicating when to retry
   - Example response:
     ```json
     {
       "statusCode": 429,
       "message": "Too Many Requests",
       "error": "Too Many Requests"
     }
     ```

5. **Server Errors**:
   - Returns 500 Internal Server Error for unexpected errors
   - Logs detailed error information for debugging
   - Common scenarios:
     - Database connection failures
     - External API service outages
     - Unhandled exceptions in application code
   - Example responses:

     **Database Connection Error**:
     ```json
     {
       "statusCode": 500,
       "message": "Unable to connect to database",
       "error": "Internal Server Error"
     }
     ```

     **External API Failure**:
     ```json
     {
       "statusCode": 500,
       "message": "Weather API service unavailable",
       "error": "Internal Server Error"
     }
     ```

     **Unhandled Exception**:
     ```json
     {
       "statusCode": 500,
       "message": "Unexpected error occurred",
       "error": "Internal Server Error"
     }
     ```

     **Validation Error in Service**:
     ```json
     {
       "statusCode": 500,
       "message": "Invalid data format in service layer",
       "error": "Internal Server Error"
     }
     ```


## Installation

## Prerequisites

Before installation, ensure you have the following installed:
- **Node.js**: v23.4.0
- **PostgreSQL**
- **Redis**

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/weather-app.git
   cd weather-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
  
   ```bash
    # Application Configuration
    APP_PORT=3000 # Port on which the application will run

    # Weather API Configuration
    WEATHER_API_KEY=weather api token # API key for Tomorrow.io weather service
    WEATHER_API_URL=https://api.tomorrow.io/v4/weather # Base URL for Tomorrow.io API

    # Database Configuration
    DATABASE_URL=postgres://postgres:78951@localhost:5432/weather_db # PostgreSQL connection string
    # Format: postgres://username:password@host:port/database_name

    # Authentication Configuration
    JWT_SECRET=jwt_secret # Secret key for JWT token generation
    JWT_EXPIRATION=1h # Expiration time for JWT tokens (e.g., 1h for 1 hour)

    # Redis Configuration
    REDIS_HOST=127.0.0.1 # Redis server host
    REDIS_PORT=6379 # Redis server port
    REDIS_TTL=60000 # Time-to-live for cached data in milliseconds
   ```
  

4. Run the seed script to populate city data:
   ```bash
   npm run seed
   ```

5. Run the application:
   ```bash
   npm run start:dev
   ```
6. Run the Job
   ```bash
   npm run start:weather:favorite
   ```

## API Endpoints
For detailed API documentation and to try out the endpoints, visit the Swagger documentation at `/api-doc` when the application is running.

### Authentication

#### `POST /auth/login` 
  - User login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybQ-A"
}
```

### Weather

#### `GET /weather/current` 
  - Get current(RealTime) weather for location
**Request Parameters:**
```json
{
  "city": "London"
}
```

**Response:**
```json
{
    "city": "london",
    "lat": "51.50740000",
    "lng": "-0.12780000",
    "weatherData": {
        "cloudBase": null,
        "cloudCeiling": null,
        "cloudCover": 9,
        "dewPoint": 5.81,
        "freezingRainIntensity": 0,
        "hailProbability": 7.4,
        "hailSize": 0.42,
        "humidity": 91,
        "precipitationProbability": 0,
        "pressureSurfaceLevel": 1021.46,
        "rainIntensity": 0,
        "sleetIntensity": 0,
        "snowIntensity": 0,
        "temperature": 7.19,
        "temperatureApparent": 7.19,
        "uvHealthConcern": 0,
        "uvIndex": 0,
        "visibility": 16,
        "weatherCode": 1000,
        "windDirection": 214.13,
        "windGust": 6.63,
        "windSpeed": 3
    }
}
```

#### `GET /weather/forecast` 
  - Get 5 days weather forecast for location
**Request Parameters:**
```json
{
  "city": "London"
}
```

**Response:**
```json
{
    "city": "London",
    "lat": "51.50740000",
    "lng": "-0.12780000",
    "weatherData": [
        {
            "time": "2024-12-30T06:00:00Z",
            "values": {
                "cloudBaseAvg": 0.25,
                "cloudBaseMax": 0.4,
                "cloudBaseMin": 0,
                "cloudCeilingAvg": 0.25,
                "cloudCeilingMax": 0.4,
                "cloudCeilingMin": 0,
                "cloudCoverAvg": 93.29,
                "cloudCoverMax": 100,
                "cloudCoverMin": 9,
                "dewPointAvg": 5.49,
                "dewPointMax": 6.74,
                "dewPointMin": 4.69,
                "evapotranspirationAvg": 0.022,
                "evapotranspirationMax": 0.056,
                "evapotranspirationMin": 0.006,
                "evapotranspirationSum": 0.539,
                "freezingRainIntensityAvg": 0,
                "freezingRainIntensityMax": 0,
                "freezingRainIntensityMin": 0,
                "hailProbabilityAvg": 52.2,
                "hailProbabilityMax": 99.1,
                "hailProbabilityMin": 3,
                "hailSizeAvg": 5.63,
                "hailSizeMax": 9.81,
                "hailSizeMin": 0.01,
                "humidityAvg": 86.79,
                "humidityMax": 96,
                "humidityMin": 80,
                "iceAccumulationAvg": 0,
                "iceAccumulationLweAvg": 0,
                "iceAccumulationLweMax": 0,
                "iceAccumulationLweMin": 0,
                "iceAccumulationLweSum": 0,
                "iceAccumulationMax": 0,
                "iceAccumulationMin": 0,
                "iceAccumulationSum": 0,
                "moonriseTime": "2024-12-30T08:18:28Z",
                "moonsetTime": "2024-12-30T14:54:57Z",
                "precipitationProbabilityAvg": 0,
                "precipitationProbabilityMax": 0,
                "precipitationProbabilityMin": 0,
                "pressureSurfaceLevelAvg": 1024.26,
                "pressureSurfaceLevelMax": 1026.2,
                "pressureSurfaceLevelMin": 1021.1,
                "rainAccumulationAvg": 0,
                "rainAccumulationLweAvg": 0,
                "rainAccumulationLweMax": 0,
                "rainAccumulationLweMin": 0,
                "rainAccumulationMax": 0,
                "rainAccumulationMin": 0,
                "rainAccumulationSum": 0,
                "rainIntensityAvg": 0,
                "rainIntensityMax": 0,
                "rainIntensityMin": 0,
                "sleetAccumulationAvg": 0,
                "sleetAccumulationLweAvg": 0,
                "sleetAccumulationLweMax": 0,
                "sleetAccumulationLweMin": 0,
                "sleetAccumulationLweSum": 0,
                "sleetAccumulationMax": 0,
                "sleetAccumulationMin": 0,
                "sleetIntensityAvg": 0,
                "sleetIntensityMax": 0,
                "sleetIntensityMin": 0,
                "snowAccumulationAvg": 0,
                "snowAccumulationLweAvg": 0,
                "snowAccumulationLweMax": 0,
                "snowAccumulationLweMin": 0,
                "snowAccumulationLweSum": 0,
                "snowAccumulationMax": 0,
                "snowAccumulationMin": 0,
                "snowAccumulationSum": 0,
                "snowIntensityAvg": 0,
                "snowIntensityMax": 0,
                "snowIntensityMin": 0,
                "sunriseTime": "2024-12-30T07:45:00Z",
                "sunsetTime": "2024-12-30T16:20:00Z",
                "temperatureApparentAvg": 7.6,
                "temperatureApparentMax": 8.69,
                "temperatureApparentMin": 6.63,
                "temperatureAvg": 7.6,
                "temperatureMax": 8.69,
                "temperatureMin": 6.63,
                "uvHealthConcernAvg": 0,
                "uvHealthConcernMax": 0,
                "uvHealthConcernMin": 0,
                "uvIndexAvg": 0,
                "uvIndexMax": 0,
                "uvIndexMin": 0,
                "visibilityAvg": 16,
                "visibilityMax": 16,
                "visibilityMin": 16,
                "weatherCodeMax": 1001,
                "weatherCodeMin": 1001,
                "windDirectionAvg": 232.63,
                "windGustAvg": 8.12,
                "windGustMax": 10.5,
                "windGustMin": 6.63,
                "windSpeedAvg": 3.59,
                "windSpeedMax": 4.5,
                "windSpeedMin": 3
            }
        },
    ]
}
```

### Locations

#### `GET /locations` 
  - Get all available locations(cities).
  
**Response:**
```json
[
    {
        "id": 1,
        "city": "New York",
        "country": "USA",
        "lat": "40.71280000",
        "lng": "-74.00600000"
    }
]
```

#### `POST /locations/favorites` 
  - Add favorite location for user, user Id is fetch from token.
**Request:**
```json
{
  "cityId": 1
}
```

**Response:**
```json
{
    "cityId": 1,
    "userId": 1,
    "id": 16,
    "createdAt": "2024-12-31T04:19:20.813Z",
    "updatedAt": "2024-12-31T04:19:20.813Z"
}
```

#### `GET /locations/favorites` 
  - Get favorite locations for User, user Id is fetch from token.

**Response:**
```json
[
    {
        "id": 1,
        "cityId": 1,
        "userId": 1,
        "createdAt": "2024-12-30T08:54:25.012Z",
        "updatedAt": "2024-12-30T08:54:25.012Z",
        "location": {
            "id": 1,
            "city": "New York",
            "country": "USA",
            "lat": "40.71280000",
            "lng": "-74.00600000",
            "createdAt": "2024-12-30T08:53:50.468Z",
            "updatedAt": "2024-12-30T08:53:50.468Z"
        }
    }
]
```

#### `DELETE /locations/favorites/:id` 
  - Get favorite locations for User, user Id is fetch from token.
**Response:**
```json

```

### Users

#### `POST /users` 
  - Create a new user.
**Request:**
```json
{
  "name": "Shubham Jain", 
  "userName": "shubhamjain", 
  "password": "securepassword"
}
```

**Response:**
```json
{
    "name": "Shubham Jain",
    "userName": "shubhamjain",
    "id": 2,
    "createdAt": "2024-12-31T04:21:09.794Z",
    "updatedAt": "2024-12-31T04:21:09.794Z"
}
```

### GraphQL

#### GraphQL Endpoint: `/graphql`
**Example Query:**
```graphql
query {
  getWeatherForecast(city: "London"),
  getCurrentWeather(city: "London")
}
```

**Example Response:**
```json
{
    "data": {
        "getWeatherForecast": "{\"city\":\"London\",\"lat\":\"51.50740000\",\"lng\":\"-0.12780000\",\"weatherData\":[...]}",
        "getCurrentWeather": "{\"city\":\"London\",\"lat\":\"51.50740000\",\"lng\":\"-0.12780000\",\"weatherData\":{\"cloudBase\":null,\"cloudCeiling\":null,\"cloudCover\":9,\"dewPoint\":5.81,\"freezingRainIntensity\":0,\"hailProbability\":47.7,\"hailSize\":0.96,\"humidity\":91,\"precipitationProbability\":0,\"pressureSurfaceLevel\":1021.42,\"rainIntensity\":0,\"sleetIntensity\":0,\"snowIntensity\":0,\"temperature\":7.19,\"temperatureApparent\":7.19,\"uvHealthConcern\":0,\"uvIndex\":0,\"visibility\":16,\"weatherCode\":1000,\"windDirection\":214.13,\"windGust\":6.63,\"windSpeed\":3}}"
    }
}
```

## Testing

The application includes comprehensive unit and end-to-end (e2e) tests to ensure functionality, reliability, and performance:

### Test Coverage
Test cases have been added for:
- Authentication module (auth)
- Location management module (locations)  
- Weather data module (weather)

### Unit Tests
- Tests focus on individual service functions and utility methods
- Example: Testing the weather.service to validate API integration with Tomorrow.io

### End-to-End (e2e) Tests
- Covers the complete API flow, ensuring all modules work together as expected
- Example: Simulating a user logging in, fetching current weather data, and managing favorite locations

### Mocking
- Third-party APIs (Tomorrow.io) and database interactions are mocked to simulate real-world scenarios and reduce dependencies

### Coverage Report
Run the following command to generate a test coverage report:
```bash
npm run test:coverage
```
This ensures all critical parts of the application are tested adequately.

### Testing Commands
Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

## License

Created By Shubham Jain