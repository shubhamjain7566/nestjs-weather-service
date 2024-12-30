import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { UserFavoriteLocationsDto } from './dto/userFavoriteLocations.dto';
import { LocationDto } from './dto/locations.dto';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../users/user.decorator';
import { RateLimiterGuard } from '../rateLimit/rateLimit.guard';

@ApiTags('Locations')
@UseGuards(RateLimiterGuard)
@Controller('locations')
export class LocationsController { 
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, description: 'List of all locations', type: [LocationDto] })
  async getLocations(): Promise<LocationDto[]> {
    return this.locationsService.getLocations();
  }

  @Post('favorites')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a location to user\'s favorites' })
  @ApiBody({ type: UserFavoriteLocationsDto })
  @ApiResponse({ status: 200, description: 'Location added to favorites', type: UserFavoriteLocationsDto })
  async addFavoriteLocation(@Body() userFavoriteLocationsDto: UserFavoriteLocationsDto, @User() user: any): Promise<UserFavoriteLocationsDto> {
    return this.locationsService.addFavoriteLocations(userFavoriteLocationsDto?.cityId, user?.userId);
  }

  @Get('favorites')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user\'s favorite locations' })
  @ApiResponse({ status: 200, description: 'List of user\'s favorite locations', type: [UserFavoriteLocationsDto] })
  async getFavoriteLocations(@User() user: any): Promise<UserFavoriteLocationsDto[]> {
    return this.locationsService.getFavoriteLocations(user?.userId);
  }

  @Delete('favorites/:favId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a location from user\'s favorites' })
  @ApiParam({ name: 'favId', description: 'The ID of the favorite location to remove', type: Number })
  @ApiResponse({ status: 200, description: 'Location removed from favorites' })
  async removeFavoriteLocation(@Param('favId') favId: number, @User() user: any): Promise<void> {
    return this.locationsService.removeFavoriteLocations(favId, user?.userId);
  }
}
