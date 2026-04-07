import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async getCurrentUser(@CurrentUser() user: { userId: string }) {
    console.log('CECEI EST UN TEST 11111111111111111');
    const userData = await this.usersService.findById(user.userId);
    return {
      success: true,
      data: userData,
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search public user profiles' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async search(@Query('q') q: string | undefined, @CurrentUser() user: { userId: string }) {
    return this.usersService.searchPublicUsers(q, user.userId);
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Get a public user profile with course stats' })
  @ApiResponse({ status: 200, description: 'Public profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found or profile is private' })
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfileWithStats(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: { id: string },
  ) {
    // Users can only update their own profile
    if (id !== user.id) {
      throw new Error('Unauthorized');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    // Users can only delete their own account
    if (id !== user.userId) {
      throw new Error('Unauthorized');
    }
    return this.usersService.remove(id);
  }
}
