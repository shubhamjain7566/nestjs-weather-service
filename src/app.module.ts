import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherModule } from './weather/weather.module';
import { LocationsModule } from './locations/locations.module';
import { CustomLogger } from './logger.service';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { redisConfig } from './cache/redis.config';
import { RateLimiterService } from './rateLimit/rateLimit.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register(redisConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: (configService) => {
        return {
        secret: configService.get('JWT_SECRET'),
        signOptions: { 
          algorithm : "HS256",
          expiresIn: configService.get('JWT_EXPIRATION') },
      }},
      inject: [ConfigService]
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, 
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      formatError: (error) => {
        const { message, locations, path } = error;
        return { message, locations, path };
      },
    }),
    PassportModule,
    LocationsModule,
    WeatherModule,
    UserModule,
    AuthModule
  ],
  providers: [ 
    CustomLogger,
    RateLimiterService
  ], 
  exports: [CustomLogger, PassportModule], 
})
export class AppModule {}
