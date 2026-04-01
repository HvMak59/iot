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
  ParseArrayPipe,
} from '@nestjs/common';
// import {
//   KEY_SEPARATOR,
//   USER_NOT_IN_REQUEST_HEADER,
// } from 'src/app_config/constants';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { getTryCatchErrorStr } from 'utils/others';
// import { UserId } from 'src/utils/req-user-id.decorator';
import { CurrentOpenAlertService } from './current-open-alert.service';
import { CreateCurrentOpenAlertDto } from './dto/create-current-open-alert.dto';
import { FindAlertsByMultipleIDsDTO } from './dto/find-current-open-alert-byMultipleIDs.dto';
import { FindCurrentOpenAlertDto } from './dto/find-current-open-alert.dto';
import { UpdateCurrentOpenAlertDto } from './dto/update-current-open-alert.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { UserId } from 'src/utils/req-user-id.decorator';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
import { getTryCatchErrorStr } from 'src/utils/others';

@Controller('current-open-alert')
export class CurrentOpenAlertController {
  private readonly logger = winstonServerLogger(
    CurrentOpenAlertController.name,
  );
  constructor(
    private readonly currentOpenAlertService: CurrentOpenAlertService,
  ) { }
  @Post('bulk')
  async createBulk(
    @UserId() userId: string,
    // When we want to validate arrays we should use '@Body(new ParseArrayPipe({ items: CreateAlertDto }))' like this
    @Body(new ParseArrayPipe({ items: CreateCurrentOpenAlertDto }))
    createCurrentOpenAlertDTOs: CreateCurrentOpenAlertDto[],
  ) {
    const fnName = this.createBulk.name;
    const input = `Input : No of records ${createCurrentOpenAlertDTOs.length}`;

    this.logger.debug(`${fnName} : ${input}`);

    if (userId) {
      for (let i = 0; i < createCurrentOpenAlertDTOs.length; i++) {
        createCurrentOpenAlertDTOs[i].createdBy = userId;
      }
      /* return await this.currentOpenAlertService.create(
        createCurrentOpenAlertDTOs,
      ); */
    } else {
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    return await this.currentOpenAlertService.createBulk2(
      createCurrentOpenAlertDTOs,
    );
  }

  @Post('bulk3')
  async createBulk3(createCurrentOpenAlertDTOs: CreateCurrentOpenAlertDto[]) {
    const fnName = this.createBulk3.name;
    const input = `Input : ${JSON.stringify([...createCurrentOpenAlertDTOs])}`;
    this.logger.debug(`${fnName} : ${input}`);
    return await this.currentOpenAlertService.createBulk3(
      createCurrentOpenAlertDTOs,
    );
  }

  @Post()
  async create(
    @UserId() userId: string,
    // When we want to validate arrays we should use '@Body(new ParseArrayPipe({ items: CreateAlertDto }))' like this
    @Body()
    createCurrentOpenAlertDTO: CreateCurrentOpenAlertDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createCurrentOpenAlertDTO)}`;

    this.logger.debug(`${fnName} : ${input}`);

    if (userId) {
      return await this.currentOpenAlertService.create(
        createCurrentOpenAlertDTO,
      );
    } else {
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
  }

  @Get('findAll')
  findAll(@Query() findCurrentOpenAlertDto: FindCurrentOpenAlertDto) {
    return this.currentOpenAlertService.findAll(findCurrentOpenAlertDto);
  }

  @Get('findAll/relations')
  findAllWthRelations(
    @Query() findCurrentOpenAlertDto: FindCurrentOpenAlertDto,
  ) {
    const relationsRequired = true;
    return this.currentOpenAlertService.findAll(findCurrentOpenAlertDto, true);
  }

  @Get('findOne')
  findOne(@Query() findCurrentOpenAlertDto: FindCurrentOpenAlertDto) {
    return this.currentOpenAlertService.findOne(findCurrentOpenAlertDto);
  }

  @Get('findOne/relations')
  findOneWthRelations(
    @Query() findCurrentOpenAlertDto: FindCurrentOpenAlertDto,
  ) {
    const relationsRequired = true;
    return this.currentOpenAlertService.findOne(
      findCurrentOpenAlertDto,
      relationsRequired,
    );
  }

  @Get('byMultipleIDs')
  async findByMultipleIDs(@Query() searchCriteria: FindAlertsByMultipleIDsDTO) {
    const fnName = 'findByMultipleIDs';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      return await this.currentOpenAlertService.findByMultipleIDs(
        searchCriteria,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Get('byMultipleIDs/relations')
  async findByMultipleIDsWithRelations(
    @Query() searchCriteria: FindAlertsByMultipleIDsDTO,
  ) {
    const fnName = 'findByMultipleIDs';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      const relationsRequired = true;
      return await this.currentOpenAlertService.findByMultipleIDs(
        searchCriteria,
        relationsRequired,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Get('searchTerm')
  findAllBySearchTerm(@Query('searchTerm') searchTerm: string) {
    return this.currentOpenAlertService.findAllBySearchTerm(searchTerm);
  }

  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateCurrentOpenAlertDto: UpdateCurrentOpenAlertDto,
  ) {
    const fnName = 'update()';
    const input = `Input : Update object : ${JSON.stringify(
      updateCurrentOpenAlertDto,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error('User is not available in request header');
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateCurrentOpenAlertDto.updatedBy = userId;
      this.logger.debug('Calling udpate service');

      return await this.currentOpenAlertService.update(
        id,
        updateCurrentOpenAlertDto,
      );
    }
  }

  @Patch('many')
  async updateMany(@Body() updateAlertDTOs: UpdateCurrentOpenAlertDto[]) {
    const fnName = this.updateMany.name;
    const input = `Input : ${JSON.stringify([...updateAlertDTOs])}`;
    this.logger.debug(`${fnName} : ${input}`);
    return await this.currentOpenAlertService.updateMany(updateAlertDTOs);
  }

  @Delete()
  delete(@Query() findCurrentOpenAlert: FindCurrentOpenAlertDto) {
    return this.currentOpenAlertService.delete(findCurrentOpenAlert);
  }

  /* @Delete('softDelete')
  softDelete(@Query('id') id: string) {
    return this.currentOpenAlertService.softDelete(id);
  } */

  @Patch('restore')
  restore(@Query('id') id: string) {
    return this.currentOpenAlertService.restore(id);
  }
}
