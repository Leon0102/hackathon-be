import { Controller, Post, Body, Param, Delete, Get, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { Auth, AuthUser } from '../../decorators';
import { UserRole } from '../../constants';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/request/create-group.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('groups')
@ApiTags('Groups')
@UseInterceptors(ClassSerializerInterceptor)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Auth([UserRole.USER, UserRole.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  createGroup(@Body() dto: CreateGroupDto, @AuthUser() user) {
    return this.groupsService.createGroup(dto, user._id.toString());
  }

  @Post(':id/join')
  @Auth([UserRole.USER, UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  joinGroup(@Param('id') id: string, @AuthUser() user) {
    return this.groupsService.joinGroup(id, user._id.toString());
  }

  @Delete(':id/leave')
  @Auth([UserRole.USER, UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  leaveGroup(@Param('id') id: string, @AuthUser() user) {
    return this.groupsService.leaveGroup(id, user._id.toString());
  }

  @Get('my-groups')
  @Auth([UserRole.USER, UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  getMyGroups(@AuthUser() user) {
    return this.groupsService.getMyGroups(user._id.toString());
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getGroupById(@Param('id') id: string) {
    return this.groupsService.getGroupById(id);
  }
}
