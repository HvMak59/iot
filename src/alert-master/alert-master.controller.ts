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
import {
  KEY_SEPARATOR,
  USER_NOT_IN_REQUEST_HEADER,
} from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { UserId } from 'src/utils/req-user-id.decorator';
import { AlertMasterService } from './alert-master.service';
import { CreateAlertMasterDto } from './dto/create-alert-master.dto';
import { FindAlertMasterDto } from './dto/find-alert-master.dto';
import { UpdateAlertMasterDto } from './dto/update-alert-master.dto';

@Controller('alert-master')
export class AlertMasterController {
  private readonly logger = winstonServerLogger(AlertMasterController.name);

  constructor(private readonly alertMasterService: AlertMasterService) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createAlertMasterDto: CreateAlertMasterDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : Create AlertMasterDto : ${JSON.stringify(
      createAlertMasterDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // if (userId == null) {
    //   this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
    //   throw new Error(USER_NOT_IN_REQUEST_HEADER);
    // } else {
    createAlertMasterDto.createdBy = userId;
    this.logger.debug(`${fnName}: Calling create service`);
    return await this.alertMasterService.create(createAlertMasterDto);
    // }
  }

  // @Post('bulk')
  // async createBulk(
  //   @UserId() userId: string,
  //   @Body() createAlertMasterDTOs: CreateAlertMasterDto[],
  // ) {
  //   const fnName = this.createBulk.name;
  //   const input = `Input : Create AlertMasterDtos : ${JSON.stringify(
  //     createAlertMasterDTOs,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     for (const alertMaster of createAlertMasterDTOs) {
  //       alertMaster.createdBy = userId;
  //     }
  //     this.logger.debug(`${fnName}: Calling createBulk service`);
  //     return await this.alertMasterService.createBulk(createAlertMasterDTOs);
  //   }
  // }

  // @Get('many')
  // async findAll(@Query() searchCriteria: FindAlertMasterDto) {
  //   const fnName = this.findAll.name;
  //   const input = `Input : Find AlertMaster with searchCriteria: ${JSON.stringify(
  //     searchCriteria,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   this.logger.debug(`${fnName} : Calling findAll service`);

  //   return await this.alertMasterService.findAll(searchCriteria);
  // }

  // @Get('many/relations')
  // async findAllWthRelations(@Query() searchCriteria: FindAlertMasterDto) {
  //   const fnName = this.findAllWthRelations.name;
  //   const input = `Input : Find AlertMaster with relations and searchCriteria: ${JSON.stringify(
  //     searchCriteria,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   this.logger.debug(`${fnName} : Calling findAll service`);

  //   const relationsRequired = true;
  //   return await this.alertMasterService.findAll(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Get('findOne')
  // async findOne(@Query() searchCriteria: FindAlertMasterDto) {
  //   const fnName = this.findOne.name;
  //   const input = `Input : Find AlertMaster with searchCriteria : ${JSON.stringify(
  //     searchCriteria,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   this.logger.debug(`${fnName} : Calling findOne service`);

  //   return await this.alertMasterService.findOne(searchCriteria);
  // }

  // @Get('findOne/relations')
  // async findOneWthRelations(@Query() searchCriteria: FindAlertMasterDto) {
  //   const fnName = this.findOne.name;
  //   const input = `Input : Find AlertMaster with relations and searchCriteria : ${JSON.stringify(
  //     searchCriteria,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   this.logger.debug(`${fnName} : Calling findOne service`);

  //   const relationsRequired = true;
  //   return await this.alertMasterService.findOne(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // // @Patch()
  // // async update(
  // //   @UserId() userId: string,
  // //   @Query('id') id: string,
  // //   @Body() updateAlertMasterDto: UpdateAlertMasterDto,
  // // ) {
  // //   const fnName = this.update.name;
  // //   const input = `Input: Id: ${id} and update object : ${JSON.stringify(
  // //     updateAlertMasterDto,
  // //   )}`;

  // //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  // //   if (userId == null) {
  // //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  // //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  // //   } else {
  // //     updateAlertMasterDto.updatedBy = userId;
  // //     this.logger.debug(`${fnName}: Calling update service`);
  // //     return await this.alertMasterService.update(id, updateAlertMasterDto);
  // //   }
  // // }

  // @Delete()
  // async remove(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.remove.name;
  //   const input = `Input : AlertMaster id : ${id} to be deleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     this.logger.debug(`${fnName}: Calling delete service`);
  //   }
  //   return await this.alertMasterService.delete(id);
  // }

  // @Delete('softDelete')
  // async softDelete(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.softDelete.name;
  //   const input = `Input : AlertMaster id : ${id} to be softDeleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     let alertMasterToBeSoftDeleted =
  //       await this.alertMasterService.findOneById(id);
  //     if (alertMasterToBeSoftDeleted) {
  //       alertMasterToBeSoftDeleted.deletedBy = userId;
  //       this.logger.debug(`${fnName} : Calling softDelete service`);
  //       return await this.alertMasterService.softDelete(
  //         id,
  //         alertMasterToBeSoftDeleted,
  //       );
  //     } else {
  //       this.logger.error(`${fnName} : AlertMaster id : ${id} not found`);
  //       throw new Error(`AlertMaster id : ${id} not found`);
  //     }
  //   }
  // }

  // @Patch('restore')
  // async restore(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.restore.name;
  //   const input = `Input : AlertMaster id : ${id} to be restored`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     this.logger.debug(`${fnName} : Calling restore service`);
  //     const restored = await this.alertMasterService.restore(id);
  //     return restored;
  //   }
  // }
}
