import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { MetricsAttributeAdaptorService } from './metrics-attribute-adaptor.service';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { FindMetricsAttributeAdaptorsFromMultipleIDsDto } from './dto/findMetricsAttributeAdaptorsFromMultipleIDsDto.dto';
// import { CreateMetricsAttributeAdaptorDto } from './dto/create-metrics-attribute-adaptor.dto';
// import { UpdateMetricsAttributeAdaptorDto } from './dto/update-metrics-attribute-adaptor.dto';

// import { FindMetricsAttributeAdaptorDto } from './dto/find-metrics-attribute-adaptor.dto';
// import { FindMetricsAttributeAdaptorsFromMultipleIDsDto } from './dto/find-metrics-attribute-adaptors-from-multipleIDs.dto';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config (1)';
// import { KEY_SEPARATOR, NO_RECORD, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
// import { UserId } from 'src/utils/req-user-id-decorator';

@Controller('metrics-attribute-adaptor')
export class MetricsAttributeAdaptorController {
  private readonly logger = winstonServerLogger(
    MetricsAttributeAdaptorController.name,
  );

  constructor(
    private readonly metricsAttributeAdaptorService: MetricsAttributeAdaptorService,
  ) { }

  // @Post()
  // async create(
  //   @UserId() userId: string,
  //   @Body() createMetricsAttributeAdaptorDto: CreateMetricsAttributeAdaptorDto
  // ) {
  //   const fnName = this.create.name;
  //   const input = `Input : Create object : ${JSON.stringify(createMetricsAttributeAdaptorDto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //   }
  //   else {
  //     createMetricsAttributeAdaptorDto.createdBy = userId;
  //     this.logger.debug(`${fnName}: Calling create service`);
  //     return await this.metricsAttributeAdaptorService.create(createMetricsAttributeAdaptorDto);
  //   }
  // }

  // // 
  // @Get()
  // async findAll(@Query() searchCriteria: FindMetricsAttributeAdaptorDto) {
  //   const fnName = this.findAll.name;
  //   const input = `Input : Find metricsAttributeAdaptor with searchCriteria : ${JSON.stringify(searchCriteria)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   this.logger.debug(`${fnName}: Calling finaAll service`);

  //   return await this.metricsAttributeAdaptorService.findAll(searchCriteria);
  // }

  // @Get('relations')
  // async findAllWthRelations(@Query() searchCriteria: FindMetricsAttributeAdaptorDto) {
  //   const fnName = this.findAllWthRelations.name;
  //   const input = `Input : Find metricsAttributeAdaptor with relation with searchCriteria : ${JSON.stringify(searchCriteria)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   this.logger.debug(`${fnName}: Calling finaAll service`);

  //   const relationsRequired = true;
  //   return await this.metricsAttributeAdaptorService.findAll(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Get('id')
  // async findOneById(@Query('id') id: string) {
  //   const fnName = this.findOneById.name;
  //   const input = `Input : Find metricsAttributeAdaptor by id : ${id}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   this.logger.debug(`${fnName} : Calling findOneById service`);

  //   return await this.metricsAttributeAdaptorService.findOneById(id);
  // }

  // @Get('findOne')
  // async findOne(@Query() searchCriteria: FindMetricsAttributeAdaptorDto) {
  //   const fnName = this.findOne.name;
  //   const input = `Input : Find metricsAttributeAdaptor with searchCriteria : ${JSON.stringify(searchCriteria)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   this.logger.debug(`${fnName}: Calling finaOne service`);

  //   return await this.metricsAttributeAdaptorService.findOne(searchCriteria);
  // }

  // @Get('findOne/relations')
  // async findOneWthRelations(@Query() searchCriteria: FindMetricsAttributeAdaptorDto) {
  //   const fnName = this.findOneWthRelations.name;
  //   const input = `Input : Find metricsAttributeAdaptor with relation with searchCriteria : ${JSON.stringify(searchCriteria)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   this.logger.debug(`${fnName}: Calling finaOne service`);

  //   const relationsRequired = true;
  //   return await this.metricsAttributeAdaptorService.findOne(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Public()
  @Get('findAllWithMetricsAttribute')
  async findAllWithMetricsAttribute(
    @Query() searchCriteria: FindMetricsAttributeAdaptorsFromMultipleIDsDto,
  ) {
    const fnName = this.findAllWithMetricsAttribute.name;
    const input = `Input : Find metricsAttributeAdaptor with searchCriteria ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName}: Calling findAllWithMetricsAttribute service`);

    return await this.metricsAttributeAdaptorService.findAllWithMetricsAttribute(searchCriteria);
  }

  // @Patch()
  // async update(
  //   @UserId() userId: string,
  //   @Query('id') id: string,
  //   @Body() updateMetricsAttributeAdaptorDto: UpdateMetricsAttributeAdaptorDto,
  // ) {
  //   const fnName = this.update.name;
  //   const input = `Input : Id : ${id}, updateMetricsAttributeAdaptorDto : ${JSON.stringify(updateMetricsAttributeAdaptorDto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   }
  //   else {
  //     updateMetricsAttributeAdaptorDto.updatedBy = userId;
  //     this.logger.debug(`${fnName}: Calling update service`);

  //     return await this.metricsAttributeAdaptorService.update(
  //       id,
  //       updateMetricsAttributeAdaptorDto,
  //     );
  //   }
  // }

  // @Delete()
  // async delete(
  //   @UserId() userId: string,
  //   @Query('id') id: string
  // ) {
  //   const fnName = this.delete.name;
  //   const input = `Input : Delete metricsAttributeAdaptor id : ${id}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   }
  //   else {
  //     this.logger.debug(`${fnName}: Calling delete service`);
  //     return await this.metricsAttributeAdaptorService.delete(id);
  //   }
  // }

  // @Delete('softDelete')
  // async softDelete(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.softDelete.name;
  //   const input = `Input : MetricsAttributeAdaptor id : ${id} to be softDeleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   }
  //   else {
  //     let metricsAttrAdaptorToBeDeleted = await this.metricsAttributeAdaptorService.findOneById(id);
  //     if (metricsAttrAdaptorToBeDeleted) {
  //       metricsAttrAdaptorToBeDeleted.deletedBy = userId;
  //       return await this.metricsAttributeAdaptorService.softDelete(id, metricsAttrAdaptorToBeDeleted);
  //     }
  //     else {
  //       this.logger.error(`${fnName} : ${NO_RECORD} : MetricsAttributeAdaptor id : ${id} not found`);
  //       throw new Error(`${NO_RECORD} : MetricsAttributeAdaptor id : ${id} not found`);
  //     }
  //   }
  // }

  // // @Patch('restore/:id')   changed from param to query
  // @Patch('restore')
  // async restore(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.restore.name;
  //   const input = `Input : MetricsAttributeAdaptor id : ${id} to be restored`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   }
  //   else {
  //     this.logger.debug(`${fnName} : Calling restore service`);
  //     return await this.metricsAttributeAdaptorService.restore(id);
  //   }
  // }
}
