import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { UserId } from 'src/utils/req-user-id.decorator';
import {
  KEY_SEPARATOR,
  USER_NOT_IN_REQUEST_HEADER,
} from 'src/app_config/constants';
import { FindUserRoleDto } from './dto/find-user-role.dto';
import { UserId } from 'src/utils/req-user-id.decorator';

@Controller('user-role')
export class UserRoleController {
  private readonly logger = winstonServerLogger(UserRoleController.name);
  constructor(private readonly userRoleService: UserRoleService) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createUserRoleDto: CreateUserRoleDto,
  ) {
    const fnName = 'create()';
    const input = `Input : ${JSON.stringify(createUserRoleDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(`${fnName} : User is not available in request header`);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createUserRoleDto.createdBy = userId;
      return await this.userRoleService.create(createUserRoleDto);
    }
  }

  /* @Get()
  async findAll(
    @UserId() userId: string,
    @Query() searchCriteria: FindUserRoleDto,
  ) {
    const fnName = 'findAll()';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(`${fnName} : User is not available in request header`);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      return await this.userRoleService.findAll(searchCriteria);
    }
  } */

  /* @Get()
  findOneById(@UserId() userId: string, @Query('id') id: string) {
    const fnName = 'findOneById()';
    const input = `Input : Find UserRole by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(`${fnName} : User is not available in request header`);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug('Calling findOneById service');
      return this.userRoleService.findOneById(id);
    }
  } */

  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const fnName = 'update()';
    const input = `Input : Update Object : ${JSON.stringify(
      updateUserRoleDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(`${fnName} : User is not available in request header`);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateUserRoleDto.updatedBy = userId;
      return await this.userRoleService.update(updateUserRoleDto);
    }
  }

  /* @Patch('updateFromUser')
  updateFromUser(
    @UserId() updatedBy: string,
    @Query('userId') userId: string,
    @Body() updateUserRoleDTOs: UpdateUserRoleDto[],
  ) {
    const fnName = 'updateFromUser()';
    const input = `Input : ${JSON.stringify([...updateUserRoleDTOs])}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updatedBy == null) {
      for (const updateUserRole of updateUserRoleDTOs) {
        updateUserRole.updatedBy = updatedBy;
      }
      this.logger.error(`${fnName} : User is not available in request header`);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      return this.userRoleService.updateFromUser(userId, updateUserRoleDTOs);
    }
  } */

  /* @Delete()
  async remove(@UserId() userId: string, @Query('id') id: string) {
    const fnName = 'delete()';
    const input = `UserRole Id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(`${fnName} : User is not available in request header`);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug('Calling delete service');

      return this.userRoleService.delete(id);
    }
  } */

  /* @Delete('softDelete')
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = 'softDelete()';
    const input = ` UserRole Id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(`${fnName} : User is not available in request header`);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      return await this.userRoleService.softDelete(id, userRoleToBeDeleted); // Call the service function
    }
  } */

  /* @Patch('restore')
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = 'restore()';
    const input = `Input : UserRole id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    if (userId == null) {
      this.logger.error(`${fnName} : User is not available in request header`);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      const restored = await this.userRoleService.restore(id);
      return restored;
    }
  } */
}
