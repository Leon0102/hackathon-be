import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseInterceptors
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { UserRole } from '../../constants';
import { Auth, AuthUser } from '../../decorators';
import { Users } from '../users/schema/users.schema';
import { CreateGroupDto, RecommendGroupsDto } from './dto/request';
import { GroupResponseDto } from './dto/response';
import { GroupsService } from './groups.service';

@Controller('groups')
@ApiTags('Groups')
@UseInterceptors(ClassSerializerInterceptor)
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

    @Post()
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse({
        description: 'Create a new group',
        type: GroupResponseDto
    })
    @ApiOperation({ summary: 'Create a new group' })
    async createGroup(@Body() dto: CreateGroupDto, @AuthUser() user: Users) {
        const result = await this.groupsService.createGroup(dto, (user.id ?? user._id?.toString()) as string);

        return plainToInstance(GroupResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Post(':id/join')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Join a group',
        type: GroupResponseDto
    })
    @ApiOperation({ summary: 'Join a group' })
    async joinGroup(@Param('id') id: string, @AuthUser() user: Users) {
        const result = await this.groupsService.joinGroup(id, (user.id ?? user._id?.toString()) as string);

        return plainToInstance(GroupResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Delete(':id/leave')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Leave a group',
        type: GroupResponseDto
    })
    @ApiOperation({ summary: 'Leave a group' })
    async leaveGroup(@Param('id') id: string, @AuthUser() user: Users) {
        const result = await this.groupsService.leaveGroup(id, (user.id ?? user._id?.toString()) as string);

        return plainToInstance(GroupResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Get('my-groups')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Get current user groups',
        type: [GroupResponseDto]
    })
    @ApiOperation({ summary: 'Get my groups' })
    async getMyGroups(@AuthUser() user: Users) {
        const result = await this.groupsService.getMyGroups((user.id ?? user._id?.toString()) as string);

        return result.map((group) =>
            plainToInstance(GroupResponseDto, group, {
                excludeExtraneousValues: true
            })
        );
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Get group by id',
        type: GroupResponseDto
    })
    @ApiOperation({ summary: 'Get group by id' })
    async getGroupById(@Param('id') id: string) {
        const result = await this.groupsService.getGroupById(id);

        return plainToInstance(GroupResponseDto, result, {
            excludeExtraneousValues: true
        });
    }

    @Post('recommend')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Recommend groups based on keyword',
        type: [GroupResponseDto]
    })
    @ApiOperation({ summary: 'Recommend groups based on keyword' })
    async recommendGroups(@Body() recommendDto: RecommendGroupsDto, @AuthUser() user: Users) {
        const result = await this.groupsService.recommendGroups(
            (user.id ?? user._id?.toString()) as string,
            recommendDto
        );

        return result.map((group) =>
            plainToInstance(GroupResponseDto, group, {
                excludeExtraneousValues: true
            })
        );
    }
}
