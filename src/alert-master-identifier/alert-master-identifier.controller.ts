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
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { UserId } from 'src/utils/req-user-id.decorator';
import { AlertMasterIdentifierService } from './alert-master-identifier.service';
import { CreateAlertMasterIdentifierDto } from './dto/create-alert-master-identifier.dto';
import { FindAlertMasterIdentifierDto } from './dto/find-alert-master-identifier.dto';
import { UpdateAlertMasterIdentifierDto } from './dto/update-alert-master-identifier.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';

@Controller('alert-master-identifier')
export class AlertMasterIdentifierController {
  private readonly logger = winstonServerLogger(
    AlertMasterIdentifierController.name,
  );
  constructor(
    private readonly alertMasterIdentifierService: AlertMasterIdentifierService,
  ) { }

  @Post()
  async create(
    // @UserId() userId: string,
    @Body() createAlertMasterIdentifierDTO: CreateAlertMasterIdentifierDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : Create AlertMasterIdentifierDto : ${JSON.stringify(
      createAlertMasterIdentifierDTO,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // if (userId == null) {
    //   this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
    //   throw new Error(USER_NOT_IN_REQUEST_HEADER);
    // } else {
    // createAlertMasterIdentifierDTO.createdBy = userId;
    return await this.alertMasterIdentifierService.create(
      createAlertMasterIdentifierDTO,
    );
    // }
  }

  // @Post('bulk')
  // async createBulk(
  //   @UserId() userId: string,
  //   @Body() createAlertMasterIdentifierDto: CreateAlertMasterIdentifierDto[],
  // ) {
  //   const fnName = this.createBulk.name;
  //   const input = `Input : Create AlertMasterDtos : ${JSON.stringify(
  //     createAlertMasterIdentifierDto,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     for (const alertMasterIdentifier of createAlertMasterIdentifierDto) {
  //       alertMasterIdentifier.createdBy = userId;
  //     }
  //     this.logger.debug(`${fnName}: Calling createBulk service`);
  //     return await this.alertMasterIdentifierService.createBulk(
  //       createAlertMasterIdentifierDto,
  //     );
  //   }
  // }

  // @Get('many')
  // async findAll(@Query() searchCriteria: FindAlertMasterIdentifierDto) {
  //   const fnName = this.findAll.name;
  //   const input = `Input : Find AlertMasterIdentifier with searchCriteria: ${JSON.stringify(
  //     searchCriteria,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.alertMasterIdentifierService.findAll(searchCriteria);
  // }

  // @Get('many/relations')
  // async findAllWthRelations(
  //   @Query() searchCriteria: FindAlertMasterIdentifierDto,
  // ) {
  //   const fnName = this.findAllWthRelations.name;
  //   const input = `Input : Find AlertMasterIdentifier with relations and searchCriteria: ${JSON.stringify(
  //     searchCriteria,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   const relationsRequired = true;
  //   return await this.alertMasterIdentifierService.findAll(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Get('findOne')
  // async findOne(@Query() searchCriteria: FindAlertMasterIdentifierDto) {
  //   const fnName = this.findOne.name;
  //   const input = `Input : Find AlertMasterIdentifier with searchCriteria : ${JSON.stringify(
  //     searchCriteria,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   return await this.alertMasterIdentifierService.findOne(searchCriteria);
  // }

  // @Get('findOne/relations')
  // async findOneWthRelations(
  //   @Query() searchCriteria: FindAlertMasterIdentifierDto,
  // ) {
  //   const fnName = this.findOne.name;
  //   const input = `Input : Find AlertMasterIdentifier with relations and searchCriteria : ${JSON.stringify(
  //     searchCriteria,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   const relationsRequired = true;
  //   return await this.alertMasterIdentifierService.findOne(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Patch()
  // async update(
  //   @UserId() userId: string,
  //   @Query('id') id: string,
  //   @Body() updateAlertMasterIdentifierDto: UpdateAlertMasterIdentifierDto,
  // ) {
  //   const fnName = this.update.name;
  //   const input = `Input: Id: ${id} and update object : ${JSON.stringify(
  //     updateAlertMasterIdentifierDto,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     updateAlertMasterIdentifierDto.updatedBy = userId;
  //     return await this.alertMasterIdentifierService.update(
  //       id,
  //       updateAlertMasterIdentifierDto,
  //     );
  //   }
  // }

  // @Delete()
  // async remove(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.remove.name;
  //   const input = `Input : AlertMasterIdentifier id : ${id} to be deleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   }
  //   return await this.alertMasterIdentifierService.delete(id);
  // }

  // @Delete('softDelete')
  // async softDelete(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.softDelete.name;
  //   const input = `Input : AlertMasterIdentifier id : ${id} to be softDeleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     let alertMasterIdentifierToBeSoftDeleted =
  //       await this.alertMasterIdentifierService.findOneById(id);
  //     if (alertMasterIdentifierToBeSoftDeleted) {
  //       alertMasterIdentifierToBeSoftDeleted.deletedBy = userId;
  //       return await this.alertMasterIdentifierService.softDelete(
  //         id,
  //         alertMasterIdentifierToBeSoftDeleted,
  //       );
  //     } else {
  //       this.logger.error(
  //         `${fnName} : AlertMasterIdentifier id : ${id} not found`,
  //       );
  //       throw new Error(`AlertMasterIdentifier id : ${id} not found`);
  //     }
  //   }
  // }

  // /* async update(
  //   id: string,
  //   updateAlertMasterIdentifierDto: UpdateAlertMasterIdentifierDto,
  // ) {
  //   const mergedAMI = await this.repo.preload({
  //     id: id,
  //     ...updateAlertMasterIdentifierDto,
  //   });
  //   if (mergedAMI) return await this.repo.save(mergedAMI);
  //   else throw new Error(`AlertMasterIdentifier with id ${id} not found`);
  // } */

  // @Patch('restore')
  // async restore(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.restore.name;
  //   const input = `Input : AlertMasterIdentifier id : ${id} to be restored`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     const restored = await this.alertMasterIdentifierService.restore(id);
  //     return restored;
  //   }
  // }
}
