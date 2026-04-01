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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { Response } from 'express';
import { Public } from 'src/auth/entities/public_route';
// import { FindDeviceModelAttributesByMultipleIDsDto } from 'src/device-model-attribute/dto/find-device-model-attributes-by-multipleIDs.dto';
import { getTryCatchErrorStr } from 'src/utils/others';
import { DeviceModelMetricsAttributeFormulaService } from './device-model-metrics-attribute-formula.service';
import { CreateDeviceModelMetricsAttributeFormulaDto } from './dto/create-device-model-metrics-attributes-formula.dto';
import { FindDeviceModelMetricsAttributeFormulaDto } from './dto/find-device-model-metrics-attributes-formula.dto';
import { UpdateDeviceModelMetricsAttributeFormulaDto } from './dto/update-device-model-metrics-attributes-formula.dto';
import { FindDeviceModelMetricsAttributeFormulaByMultipleIDs } from './dto/find-device-model-metrics-attribute-formula-byMultipleIDs.dto';

@Controller('device-model-metrics-attribute-formula')
export class DeviceModelMetricsAttributeFormulaController {
  private readonly logger = winstonServerLogger(
    DeviceModelMetricsAttributeFormulaController.name,
  );
  constructor(
    private readonly deviceModelMetricsAttributeFormulaService: DeviceModelMetricsAttributeFormulaService,
  ) { }

  @Post()
  create(
    @Body()
    createDeviceModelAttributesFormulaDto: CreateDeviceModelMetricsAttributeFormulaDto,
  ) {
    const fnName = this.create.name;
    this.logger.debug(
      fnName +
      KEY_SEPARATOR +
      'Input : ' +
      JSON.stringify(createDeviceModelAttributesFormulaDto),
    );
    return this.deviceModelMetricsAttributeFormulaService.create(
      createDeviceModelAttributesFormulaDto,
    );
  }

  @Post('bulk')
  async createBulk(
    @Body()
    createDeviceModelAttributesFormulaDto: CreateDeviceModelMetricsAttributeFormulaDto[],
  ) {
    return await this.deviceModelMetricsAttributeFormulaService.createBulk(
      createDeviceModelAttributesFormulaDto,
    );
  }

  // @Get()
  // findAll(
  //   @Query()
  //   searchCriteria: FindDeviceModelMetricsAttributeFormulaDto,
  // ) {
  //   return this.deviceModelMetricsAttributeFormulaService.findAll(
  //     searchCriteria,
  //   );
  // }

  // @Get('relations')
  // findAllWthRelations(
  //   @Query()
  //   searchCriteria: FindDeviceModelMetricsAttributeFormulaDto,
  // ) {
  //   const relationsRequired = true;
  //   return this.deviceModelMetricsAttributeFormulaService.findAll(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Get('byMultipleIDs')
  // async findByMultipleIDs(
  //   @Query()
  //   findDeviceModelAttributesByMultipleIDsDto: FindDeviceModelAttributesByMultipleIDsDto,
  // ) {
  //   const fnName = 'findByMultipleIDs()';
  //   const input = `Input : searchCriteria : ${JSON.stringify(
  //     findDeviceModelAttributesByMultipleIDsDto,
  //   )}`;
  //   const msgTemplate = `${fnName} : ${input}`;
  //   try {
  //     this.logger.debug(`${msgTemplate} : Start`);
  //     return await this.deviceModelMetricsAttributeFormulaService.findByMultipleIDs(
  //       findDeviceModelAttributesByMultipleIDsDto,
  //     );
  //   } catch (error) {
  //     const errMsg = getTryCatchErrorStr(error);
  //     this.logger.error(`${msgTemplate} : ${errMsg}`);
  //     throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //   } finally {
  //     this.logger.debug(`${msgTemplate} : End`);
  //   }
  // }

  @Public()
  @Get('byMultipleIDs/relations')
  async findByMultipleIDsWthRelations(
    @Query()
    findDeviceModelAttributesByMultipleIDsDto: FindDeviceModelMetricsAttributeFormulaByMultipleIDs,
  ) {
    console.log("in controller");
    const fnName = 'findByMultipleIDs() with relations';
    const input = `Input : searchCriteria : ${JSON.stringify(
      findDeviceModelAttributesByMultipleIDsDto,
    )}`;
    const msgTemplate = `${fnName} : ${input}`;
    const relationsRequired = true;
    try {
      this.logger.debug(`${msgTemplate} : Start`);
      return await this.deviceModelMetricsAttributeFormulaService.findByMultipleIDs(
        findDeviceModelAttributesByMultipleIDsDto,
        relationsRequired,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${msgTemplate} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${msgTemplate} : End`);
    }
  }

  /*  @Get()
  findOne(@Query('id') id: string) {
    return this.deviceModelMetricsAttributeFormulaService.findOne(id);
  } */

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateDeviceModelMetricsAttributesFormulaDto: UpdateDeviceModelMetricsAttributeFormulaDto,
  ) {
    return this.deviceModelMetricsAttributeFormulaService.update(
      +id,
      updateDeviceModelMetricsAttributesFormulaDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceModelMetricsAttributeFormulaService.remove(+id);
  }
}
