import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { MetricsAttributeService } from './metrics-attribute.service';
import { CreateMetricsAttributeDto } from './dto/create-metrics-attribute.dto';
import { UpdateMetricsAttributeDto } from './dto/update-metrics-attribute.dto';
import { Response } from 'express';
import { FindMetricsAttributeDto } from './dto/find-metrics-attribute.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { UserId } from 'src/utils/req-user-id.decorator';
import {
  KEY_SEPARATOR,
  NO_RECORD,
  USER_NOT_IN_REQUEST_HEADER,
} from 'src/app_config/constants';
import { UserId } from 'src/utils/req-user-id.decorator';

@Controller('metrics-attribute')
export class MetricsAttributeController {
  private readonly logger = winstonServerLogger(
    MetricsAttributeController.name,
  );
  constructor(
    private readonly metricsAttributeService: MetricsAttributeService,
  ) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createMetricsAttributeDto: CreateMetricsAttributeDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createMetricsAttributeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createMetricsAttributeDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling create service`);
      return await this.metricsAttributeService.create(
        createMetricsAttributeDto,
      );
    }
  }

  @Get('many')
  async findAll(@Query() searchCriteria: FindMetricsAttributeDto) {
    return await this.metricsAttributeService.findAll(searchCriteria);
  }

  @Get('relations')
  findAllWthRelations(@Query() searchCriteria: FindMetricsAttributeDto) {
    const relationsRequired = true;
    return this.metricsAttributeService.findAll(
      searchCriteria,
      relationsRequired,
    );
  }

  @Get('one')
  async findOneBy(@Query() searchCriteria: FindMetricsAttributeDto) {
    return await this.metricsAttributeService.findOneBy(searchCriteria);
  }

  @Get('fromAsset')
  async fetchMetricsAttrbsFromAsset(@Query('assetId') assetId: string) {
    this.logger.debug(
      `${this.fetchMetricsAttrbsFromAsset.name} : Input : assetId : ${assetId}`,
    );
    return await this.metricsAttributeService.fetchMetricsAttrFromAsset(
      assetId,
    );
  }

  // @Get('metricsToBeCalculated')
  // async findMetricsToBeCalculated() {
  //   const fnName = this.findMetricsToBeCalculated.name;

  //   this.logger.debug(`${fnName} : Calling findMetricsToBeCalculated service`);
  //   return await this.metricsAttributeService.metricsToBeCalculated();
  // }

  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateMetricsAttributeDto: UpdateMetricsAttributeDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id} and update object is : ${JSON.stringify(
      updateMetricsAttributeDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateMetricsAttributeDto.updatedBy = userId;
      return await this.metricsAttributeService.update(
        id,
        updateMetricsAttributeDto,
      );
    }
  }

  @Delete()
  async delete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.delete.name;
    const input = `Input : MetricsAttribute id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.metricsAttributeService.delete(id);
    }
  }

  @Delete('softDelete')
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : MetricsAttribute id : ${id} to be softDeleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      const metricAttributeToBeDeleted =
        await this.metricsAttributeService.findOneById(id);
      if (metricAttributeToBeDeleted) {
        metricAttributeToBeDeleted.deletedBy = userId;
        this.logger.debug(`${fnName} : Calling softDelete service`);
        return await this.metricsAttributeService.softDelete(
          id,
          metricAttributeToBeDeleted,
        );
      } else {
        this.logger.error(
          `${fnName} : ${NO_RECORD} : MetricsAttribute with id ${id} not found`,
        );
        throw new Error(
          `${NO_RECORD} : MetricsAttribute with id ${id} not found`,
        );
      }
    }
  }

  @Patch('restore')
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.restore.name;
    const input = `Input : MetricsAttribute id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      return await this.metricsAttributeService.restore(id, userId);
    }
  }
}
