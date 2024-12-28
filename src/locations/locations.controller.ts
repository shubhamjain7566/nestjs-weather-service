import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { UserFavoriteLocationsDto } from './dto/UserFavoriteLocations.dto';
import { LocationDto } from './dto/locations.dto';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../users/user.decorator';
import { RateLimiterGuard } from '../rateLimit/rateLimit.guard';

@UseGuards(RateLimiterGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService,) {}

  @Get()
  async getLocations(): Promise<LocationDto[]> {
    return this.locationsService.getLocations();
  }

  @Post('favorites')
  @UseGuards(AuthGuard)
  async addFavoriteLocation(@Body() userFavoriteLocationsDto: UserFavoriteLocationsDto, @User() user: any): Promise<UserFavoriteLocationsDto> {
    return this.locationsService.addFavoriteLocations(userFavoriteLocationsDto?.cityId, user?.userId);
  }

  @Get('favorites')
  @UseGuards(AuthGuard)
  async getFavoriteLocations(@User() user: any): Promise<UserFavoriteLocationsDto[]> {
    return this.locationsService.getFavoriteLocations(user?.userId);
  }

  @Delete('favorites/:favId')
  @UseGuards(AuthGuard)
  async removeFavoriteLocation(@Param('favId') favId: number, @User() user: any): Promise<void> {
    return this.locationsService.removeFavoriteLocations(favId, user?.userId);
  }
}