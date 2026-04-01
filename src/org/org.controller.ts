import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { FindOrgDto } from './dto/find-org.dto';
import { FindOrgsOrAssets as FindOrgsOrAssets } from './dto/find-orgs-or-assets';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import {
  DUPLICATE_RECORD,
  KEY_SEPARATOR,
  USER_NOT_IN_REQUEST_HEADER,
} from 'src/app_config/constants';
import { getTryCatchErrorStr, sendException } from 'src/utils/others';
import { UserId } from 'src/utils/req-user-id.decorator';

@Controller('org')
export class OrgController {
  private readonly logger = winstonServerLogger(OrgController.name);
  constructor(private readonly orgService: OrgService) { }

  @Post()
  async create(
    // @UserId() userId: string, 
    @Body() createOrgDto: CreateOrgDto) {
    const fnName = 'create()';
    const input = `Input : ${JSON.stringify(createOrgDto)}`;
    try {
      this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
      this.logger.debug(fnName + KEY_SEPARATOR + input);
      //const userId = getUserIdFromReq(req);
      // if (userId == null) {
      //   throw Error(USER_NOT_IN_REQUEST_HEADER);
      // } else {
      // return await this.orgService.create(userId, createOrgDto);
      return await this.orgService.create(createOrgDto);
      // }
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new HttpException(
        errMsg,
        errMsg.startsWith(DUPLICATE_RECORD)
          ? HttpStatus.CONFLICT
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      this.logger.debug(fnName + KEY_SEPARATOR + 'End');
    }
  }

  @Get()
  async findAll(@Query() searchCriteria: FindOrgDto) {
    const fnName = 'findAll()';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    try {
      this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
      this.logger.debug(fnName + KEY_SEPARATOR + input);
      return await this.orgService.findAll(searchCriteria);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(fnName + KEY_SEPARATOR + 'End');
    }
  }

  @Get('users')
  async findAllWithUsers(@Query() searchCriteria: FindOrgDto) {
    const fnName = 'findAllWithUsers()';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    try {
      this.logger.debug(fnName + KEY_SEPARATOR + input);
      return await this.orgService.findAllWithUsers(searchCriteria);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      sendException(errMsg);
    } finally {
      this.logger.debug(fnName + KEY_SEPARATOR + 'End');
    }
  }

  @Get('one/users')
  findOneWithUsers(@Query() searchCriteria: FindOrgDto) {
    return this.orgService.findOneWithUsers(searchCriteria);
  }

  @Get('allDescendents')
  findAllDescendentsWithoutAssets(@Query() findOrgsOrAssets: FindOrgsOrAssets) {
    const fnName = 'findAllDescendentsWithoutAssets()';
    const input = `Input : ${JSON.stringify(findOrgsOrAssets)}`;
    try {
      this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
      this.logger.debug(fnName + KEY_SEPARATOR + input);
      return this.orgService.findDescendents(findOrgsOrAssets);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(fnName + KEY_SEPARATOR + 'End');
    }
  }

  @Get('allAscendentsWithoutAssets')
  async findAllAscendentsWithoutAssets(@Query() findOrgDTO: FindOrgDto) {
    const fnName = 'findAllAscendentsWithoutAssets()';
    const input = `Input : ${JSON.stringify(findOrgDTO)}`;
    try {
      this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
      this.logger.debug(fnName + KEY_SEPARATOR + input);
      return await this.orgService.findAscendents(findOrgDTO);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(fnName + KEY_SEPARATOR + 'End');
    }
  }

  @Get('descendentsTreeWithoutAssets')
  async findDescendentsTreeWithoutAssets(
    @UserId() userId: string,
    @Query('orgID') orgID: string,
  ) {
    const fnName = 'findDescendentsTreeWithoutAssets()';
    const input = `Input : ${orgID}`;
    try {
      this.logger.debug(fnName + KEY_SEPARATOR + userId);
      this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
      this.logger.debug(fnName + KEY_SEPARATOR + input);
      const org = await this.orgService.findDescendentsTree(orgID);
      this.logger.debug(
        fnName +
        KEY_SEPARATOR +
        'Descendents Tree without assets : ' +
        JSON.stringify(org),
      );
      return org;
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(fnName + KEY_SEPARATOR + 'End');
    }
  }

  @Get('descendentsTreeWithAssets')
  async findDescendentsTreeWithAssets(@Query('orgID') orgID: string) {
    const withAssets = true;
    const fnName = 'descendentsTreeWithAssets()';
    const input = `Input : Org ID : ${orgID}`;
    try {
      this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
      this.logger.debug(fnName + KEY_SEPARATOR + input);
      return await this.orgService.findDescendentsTree(orgID, withAssets);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(fnName + KEY_SEPARATOR + 'End');
    }
  }

  @Get('relations')
  findAllWthRelations(@Query() searchCriteria: FindOrgDto) {
    const relationsRequired = true;
    return this.orgService.findAll(searchCriteria, relationsRequired);
  }

  @Patch('removeParent/:childOrgId')
  removeParent(@Param('childOrgId') childOrgId: string) {
    return this.orgService.removeParent(childOrgId);
  }

  @Patch('setParent/:childOrgId/:parentOrgId')
  addParent(
    @Param('childOrgId') childOrgId: string,
    @Param('parentOrgId') parentOrgId: string,
  ) {
    return this.orgService.setParent(childOrgId, parentOrgId);
  }

  /* @Patch('addUser/:orgId/:userId')
  addUser(@Param('orgId') orgId: string, @Param('userId') userId: string) {
    return this.orgService.addUser(orgId, userId);
  } */

  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateOrgDto: UpdateOrgDto,
  ) {
    const fnName = 'update()';
    const input = `Input : Org Id : ${id}, Update Object : ${JSON.stringify(
      updateOrgDto,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    //const userId = getUserIdFromReq(req);
    if (userId == null) {
      this.logger.error('User is not available in request header : ' + userId);
      throw new HttpException(
        'User is not available in request header',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      updateOrgDto.updatedBy = userId;
      this.logger.debug('Calling update service');
      return await this.orgService.update(id, updateOrgDto);
    }
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.orgService.restore(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.orgService.delete(id);
  }

  @Delete('softDelete/:id')
  softDelete(@Param('id') id: string) {
    return this.orgService.softDelete(id);
  }
}
