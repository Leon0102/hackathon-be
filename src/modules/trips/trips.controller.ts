import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UseInterceptors
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { ResponseDto } from '../../common/dto';
import { UserRole } from '../../constants';
import { Auth, AuthUser } from '../../decorators';
import { Users } from '../users/schema/users.schema';
import {
    CreateTripDto,
    JoinTripDto,
    RecommendMembersDto,
    SearchTripsDto,
    UpdateMemberStatusDto,
    UpdateTripDto
} from './dto/request';
import { TripResponseDto } from './dto/response';
import { TripsService } from './trips.service';

@Controller('trips')
@ApiTags('Trips')
export class TripsController {
    constructor(private readonly tripsService: TripsService) {}

    @Post()
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Create a new trip',
        type: TripResponseDto
    })
    @ApiOperation({ summary: 'Create a new trip' })
    async createTrip(@Body() createTripDto: CreateTripDto, @AuthUser() user: Users) {
        const result = await this.tripsService.createTrip(createTripDto, user.id ?? user._id?.toString());

        return plainToInstance(TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Get all trips with pagination',
        type: [TripResponseDto]
    })
    @ApiOperation({ summary: 'Get all trips' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getAllTrips(@Query('page') page = 1, @Query('limit') limit = 10) {
        const result = await this.tripsService.getAllTrips(page, limit);

        return plainToInstance(TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Get('my-trips')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Get current user trips',
        type: [TripResponseDto]
    })
    @ApiOperation({ summary: 'Get my trips' })
    async getMyTrips(@AuthUser() user: Users) {
        const result = await this.tripsService.getMyTrips(user._id.toString());

        return plainToInstance(TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Get('search')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Search trips',
        type: [TripResponseDto]
    })
    @ApiOperation({ summary: 'Search trips by destination and dates' })
    @ApiQuery({ name: 'destination', required: false, type: String })
    @ApiQuery({ name: 'startDate', required: false, type: Date })
    @ApiQuery({ name: 'endDate', required: false, type: Date })
    async searchTrips(
        @Query('destination') destination?: string,
        @Query('startDate') startDate?: Date,
        @Query('endDate') endDate?: Date
    ) {
        const result = await this.tripsService.searchTrips(destination, startDate, endDate);

        return plainToInstance(TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Get trip by ID',
        type: TripResponseDto
    })
    @ApiOperation({ summary: 'Get trip by ID' })
    async getTripById(@Param('id') id: string) {
        return this.tripsService.getTripById(id);
    }

    @Put(':id')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Update trip',
        type: TripResponseDto
    })
    @ApiOperation({ summary: 'Update trip (creator only)' })
    async updateTrip(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto, @AuthUser() user: Users) {
        const result = await this.tripsService.updateTrip(id, updateTripDto, user._id.toString());

        return plainToInstance(TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Delete(':id')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Delete trip',
        type: ResponseDto
    })
    @ApiOperation({ summary: 'Delete trip (creator only)' })
    async deleteTrip(@Param('id') id: string, @AuthUser() user: Users) {
        return this.tripsService.deleteTrip(id, user._id.toString());
    }

    @Post(':id/join')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Join trip',
        type: TripResponseDto
    })
    @ApiOperation({ summary: 'Request to join a trip' })
    async joinTrip(@Param('id') id: string, @Body() joinTripDto: JoinTripDto, @AuthUser() user: Users) {
        const result = await this.tripsService.joinTrip(id, user._id.toString(), joinTripDto);

        return plainToInstance(TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Delete(':id/leave')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Leave trip',
        type: TripResponseDto
    })
    @ApiOperation({ summary: 'Leave a trip' })
    async leaveTrip(@Param('id') id: string, @AuthUser() user: Users) {
        const result = await this.tripsService.leaveTrip(id, user._id.toString());

        return plainToInstance(TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Patch(':id/members/:memberId/status')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Update member status',
        type: TripResponseDto
    })
    @ApiOperation({ summary: 'Update member status (creator only)' })
    async updateMemberStatus(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @Body() updateMemberStatusDto: UpdateMemberStatusDto,
        @AuthUser() user: Users
    ) {
        return this.tripsService.updateMemberStatus(id, memberId, updateMemberStatusDto, user._id.toString());
    }

    @Delete(':id/members/:memberId')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Remove member from trip',
        type: TripResponseDto
    })
    @ApiOperation({ summary: 'Remove member from trip (creator only)' })
    async removeMember(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @AuthUser() user: Users
    ) {
        return this.tripsService.removeMember(id, memberId, user._id.toString());
    }

    @Post(':id/recommend')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Recommend members for a trip based on keyword',
        type: [Users]
    })
    @ApiOperation({ summary: 'Recommend members for a trip' })
    async recommendMembers(
        @Param('id') id: string,
        @Body() recommendDto: RecommendMembersDto,
        @AuthUser() user: Users
    ) {
        const result = await this.tripsService.recommendMembers(id, user._id.toString(), recommendDto);

        return plainToInstance(Users, result, {
            excludeExtraneousValues: true
        });
    }
}
