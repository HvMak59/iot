import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { OrgUserService } from './org-user.service';
// import { CreateOrgUserDto } from './dto/create-org-user.dto';
// import { UpdateOrgUserDto } from './dto/update-org-user.dto';
// import { FindOrgUserDto } from './dto/find-org-user.dto';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config (1)';
// import { UserId } from 'src/utils/req-user-id-decorator';
import { KEY_SEPARATOR, NO_RECORD, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { UserId } from 'src/utils/req-user-id.decorator';
import { FindOrgUserDto } from './dto/find-org-user.dto';
import { UpdateOrgUserDto } from './dto/update-org-user.dto';
import { CreateOrgUserDto } from './dto/create-org-user.dto';

@Controller('org-user')
export class OrgUserController {
  private logger = winstonServerLogger(OrgUserController.name);
  constructor(private readonly orgUserService: OrgUserService) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createOrgUserDto: CreateOrgUserDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createOrgUserDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createOrgUserDto.createdBy = userId;
      return await this.orgUserService.create(createOrgUserDto);
    }
  }

  @Get()
  async findAll(@Query() searchCriteria: FindOrgUserDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find OrgUser with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.orgUserService.findAll(searchCriteria);
  }

  @Get('relations')
  async findAllWthRelations(@Query() searchCriteria: FindOrgUserDto) {
    const fnName = this.findAllWthRelations.name;
    const input = `Input : Find OrgUser with relations where searchCriteria : ${searchCriteria}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;
    return await this.orgUserService.findAll(searchCriteria, relationsRequired);
  }

  @Get('findOne')
  async findOne(@Query() searchCriteria: FindOrgUserDto) {
    const fnName = this.findOne.name;
    const input = `Input : Find OrgUser by searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    return await this.orgUserService.findOne(searchCriteria);
  }

  @Patch()
  async update(
    @UserId() userId: string,
    @Query() findOrgUserDTO: FindOrgUserDto,
    @Body() updateOrgUserDto: UpdateOrgUserDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : ${JSON.stringify(updateOrgUserDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateOrgUserDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling update service`);
      return await this.orgUserService.update(
        findOrgUserDTO,
        updateOrgUserDto,
      );
    }

  }

  @Delete()
  async remove(
    @UserId() userId: string,
    // @Query('orgId') orgId: string,
    // @Query('userId') usrId: string
    @Query() findOrgUserDTO: FindOrgUserDto,
  ) {
    const fnName = this.remove.name;
    const input = `Input : OrgUser to be deleted with : ${JSON.stringify(findOrgUserDTO)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      this.logger.debug(`${fnName} : calling delete service`);
      return await this.orgUserService.delete(findOrgUserDTO);
    }
  }

  @Delete('softDelete')
  async softDelete(
    @UserId() userId: string,
    @Query() findOrgUserDTO: FindOrgUserDto,
  ) {
    const fnName = this.softDelete.name;
    const input = `Input : OrgUser to be soft deleted with : ${JSON.stringify(findOrgUserDTO)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      let orgUserToBeDeleted = await this.orgUserService.findOne(findOrgUserDTO);
      if (orgUserToBeDeleted) {
        orgUserToBeDeleted.deletedBy = userId;
        return await this.orgUserService.softDelete(findOrgUserDTO, orgUserToBeDeleted);
      }
      else {
        this.logger.error(`${fnName} : ${NO_RECORD} : orgUser not found`);
        throw new Error(`Role id : ${NO_RECORD} : orgUser not found`);
      }
    }
  }

  @Patch('restore')
  async restore(
    @UserId() userId: string,
    @Query() findOrgUserDTO: FindOrgUserDto,
  ) {
    const fnName = this.restore.name;
    const input = `Input : OrgUser to be restored with : ${JSON.stringify(findOrgUserDTO)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      this.logger.debug(`${fnName} : Calling restore service`);
      return await this.orgUserService.restore(findOrgUserDTO);
    }
  }
}
