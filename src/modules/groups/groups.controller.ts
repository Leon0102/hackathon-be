import {
    Body,
    ClassSerializerInterceptor,
    Controller,
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
import { RecommendGroupsDto } from './dto/request';
import { GroupResponseDto } from './dto/response';
import { GroupsService } from './groups.service';

@Controller('groups')
@ApiTags('Groups')
@UseInterceptors(ClassSerializerInterceptor)
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

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
