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
// import { getTryCatchErrorStr } from 'src/utils/others';
// import { UserId } from 'src/utils/req-user-id.decorator';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { FindAlertsByMultipleIDsDTO } from './dto/find-alert-byMultipleIDs.dto';
import { FindAlertForAPeriod } from './dto/find-alert-for-a-time-period.dto';
import { FindAlertDto } from './dto/find-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { UserId } from 'src/utils/req-user-id.decorator';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
import { getTryCatchErrorStr } from 'src/utils/others';
// import { UserId } from 'src/utils/req-user-id-decorator';

@Controller('alert')
export class AlertController {
  private readonly logger = winstonServerLogger(AlertController.name);
  constructor(private readonly alertService: AlertService) { }

  /* @Post()
  create(
    @Body() createAlertDto: CreateAlertDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.alertService.create(createAlertDto, response);
  } */

  @Post('bulk')
  async createBulk(
    @UserId() userId: string,
    @Body(new ParseArrayPipe({ items: CreateAlertDto }))
    createAlertDTOs: CreateAlertDto[],
  ) {
    const fnName = this.createBulk.name;
    const input = `Input : No of records : ${createAlertDTOs.length}`;

    this.logger.debug(`${fnName} : Start`);
    this.logger.debug(`${fnName} : ${input}`);
    if (userId != null) {
      for (const createAlertDto of createAlertDTOs) {
        createAlertDto.createdBy = userId;
      }
      /* return await this.alertService.createBulk(createAlertsDTOs); */
    } else {
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    return await this.alertService.createBulk2(createAlertDTOs);
  }

  @Post('bulk3')
  async createBulk3(createAlertDTOs: CreateAlertDto[]) {
    const fnName = this.createBulk3.name;
    const input = `Input : ${JSON.stringify([...createAlertDTOs])}`;
    this.logger.debug(`${fnName} : ${input}`);
    return await this.alertService.createBulk3(createAlertDTOs);
  }

  @Post()
  async create(
    @UserId() userId: string,
    @Body()
    createAlertDTO: CreateAlertDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : CreateAlertDTO : ${JSON.stringify(createAlertDTO)}`;

    this.logger.debug(`${fnName} : Start`);
    this.logger.debug(`${fnName} : ${input}`);
    if (userId != null) {
      createAlertDTO.createdBy = userId;
      return await this.alertService.create(createAlertDTO);
    } else {
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
  }

  @Post('sendToWebsocket')
  sendToWebsocket(@Query('assetId') assetId: string) {
    console.log("in send")
    this.alertService.sendToWebsocket(assetId);
  }
  @Get('findAll')
  async findAll(@Query() searchCriteria: FindAlertDto) {
    const fnName = 'findAll()';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      return await this.alertService.findAll(searchCriteria);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new Error(errMsg);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Get('findAll/relations')
  async findAllWthRelations(@Query() searchCriteria: FindAlertDto) {
    const fnName = 'findAllWthRelations()';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      const relationsRequired = true;
      return await this.alertService.findAll(searchCriteria, relationsRequired);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new Error(errMsg);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Get('findOne')
  async findOne(@Query() searchCriteria: FindAlertDto) {
    const fnName = 'findOne()';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      return await this.alertService.findOne(searchCriteria);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new Error(errMsg);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Get('findOne/relations')
  async findOneWthRelations(@Query() searchCriteria: FindAlertDto) {
    const fnName = 'findOneWthRelations()';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      const relationsRequired = true;
      return await this.alertService.findOne(searchCriteria, relationsRequired);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new Error(errMsg);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Get('byMultipleIDs')
  async findByMultipleIDs(@Query() searchCriteria: FindAlertsByMultipleIDsDTO) {
    const fnName = 'findByMultipleIDs()';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      return await this.alertService.findByMultipleIDs(searchCriteria);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(errMsg);
      throw new Error(errMsg);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }
  @Get('timePeriod')
  async findForATimePeriod(@Query() searchCriteria: FindAlertForAPeriod) {
    const fnName = this.findForATimePeriod.name;
    const input = `Input : SearchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const result = await this.alertService.findForATimePeriod(searchCriteria);
    return result;
  }

  @Get('timePeriod2')
  async findForATimePeriod2(@Query() searchCriteria: FindAlertForAPeriod) {
    const fnName = this.findForATimePeriod2.name;
    const input = `Input : SearchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const result = await this.alertService.findForATimePeriod2(searchCriteria);
    return result;
  }

  @Get('timePeriod3')
  async findForATimePeriod3(
    @Query() searchCriteria: FindAlertsByMultipleIDsDTO,
  ) {
    const fnName = this.findForATimePeriod3.name;
    const input = `Input : SearchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const result = await this.alertService.findForATimePeriod3(searchCriteria);
    return result;
  }

  @Patch()
  async update(
    @UserId() userId: string,
    @Query() id: string,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    const fnName = 'update()';
    const input = `Input : id : ${id} updateAlertDto : ${JSON.stringify(
      updateAlertDto,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    if (userId == null) {
      this.logger.error('User is not available in request header : ' + userId);
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateAlertDto.updatedBy = userId;
      this.logger.debug('Calling Update service');

      return await this.alertService.update(id, updateAlertDto);
    }
  }

  @Patch('many')
  async updateMany(@Body() updateAlertDTOs: UpdateAlertDto[]) {
    const fnName = this.updateMany.name;
    const input = `Input : ${JSON.stringify([...updateAlertDTOs])}`;
    this.logger.debug(`${fnName} : ${input}`);
    return await this.alertService.updateMany(updateAlertDTOs);
  }

  @Patch('closeAlert')
  async closeAlert(
    @Query() id: string,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    const fnName = 'closeAlert()';
    const input = `Input : id : ${id} updateAlertDto : ${JSON.stringify(
      updateAlertDto,
    )}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      return updateAlertDto.closeDateTime
        ? await this.alertService.closeAlert(id, updateAlertDto.closeDateTime)
        : await this.alertService.closeAlert(id);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Patch('closeAlerts')
  async closeAlerts(
    @Query() findAlertDto: FindAlertDto,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    const fnName = 'closeAlerts()';
    const input = `Input : findAlertDto : ${JSON.stringify(
      findAlertDto,
    )} updateAlertDto : ${JSON.stringify(updateAlertDto)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      return await this.alertService.closeAlerts(findAlertDto, updateAlertDto);
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Delete()
  remove(@Param('id') id: string) {
    return this.alertService.delete(id);
  }
}
