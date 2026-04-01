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
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { Public } from 'src/auth/entities/public_route';
// import { getTryCatchErrorStr } from 'utils/others';
import { CurrentTelemetryPayloadService } from './current-telemetry-payload.service';
import { CreateCurrentTelemetryDto } from './dto/create-current-telemetry.dto';
import { FindCurrentTelemetryForAPeriod } from './dto/find-current-telemetry-for-a-period.dto';
import { FindCurrentTelemetryPayloadsByMultipleIDs } from './dto/find-current-telemetry-payloads-byMultipleIDs.dto';
import { FindCurrentTelemetryDto } from './dto/find-current-telemetry.dto';
import { UpdateCurrentTelemetryDto } from './dto/update-current-telemetry.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';

@Controller('current-telemetry-payload')
export class CurrentTelemetryPayloadController {
  private readonly logger = winstonServerLogger(
    CurrentTelemetryPayloadController.name,
  );
  constructor(
    private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
  ) { }

  @Post()
  create(
    // @Body() createCurrentTelemetryPayloadsDto: CreateCurrentTelemetryDto[],
    @Body() createCurrentTelemetryPayloadsDto: CreateCurrentTelemetryDto[],
  ) {
    return this.currentTelemetryPayloadService.create(
      createCurrentTelemetryPayloadsDto,
    );
  }

  // @Get()
  // findAll(@Query() searchCriteria: FindCurrentTelemetryDto) {
  //   return this.currentTelemetryPayloadService.findAll(searchCriteria);
  // }

  // @Public()
  // @Get('multipleIDs')
  // async findByMultipleIDs(
  //   @Query()
  //   findCurrentTelemetryPayloadsByMultipleIDs: FindCurrentTelemetryPayloadsByMultipleIDs,
  //   /*  @Query('csvAssetIDs') csvAssetIDs: string,
  //   @Query('csvVirtualDeviceIDs') csvVirtualDeviceIDs: string,
  //   @Query('csvAttributes') csvAttributes: string, */
  // ) {
  //   const fnName = this.findByMultipleIDs.name;
  //   /* const input = `Input : ${JSON.stringify(
  //     findCurrentTelemetryPayloadsByMultipleIDs,
  //   )}`; */
  //   this.logger.debug(`${fnName} : Start`);
  //   //this.logger.debug(input);
  //   try {
  //     const result =
  //       await this.currentTelemetryPayloadService.findByMultipleIDs(
  //         findCurrentTelemetryPayloadsByMultipleIDs,
  //       );
  //     return result;
  //   } catch (error) {
  //     const errMsg = getTryCatchErrorStr(error);
  //     this.logger.error(`${fnName} : ${errMsg}`);
  //     throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //   } finally {
  //     this.logger.debug(`${fnName} : End`);
  //   }
  // }

  // @Get('multipleConditions')
  // async findByMultipleConditions(
  //   @Query() searchCriteria: FindCurrentTelemetryDto[],
  // ) {
  //   const fnName = this.findByMultipleConditions.name;
  //   this.logger.debug(`${fnName} : Start`);
  //   this.logger.debug(`Input : No of conditions : ${searchCriteria.length}`);
  //   const result =
  //     await this.currentTelemetryPayloadService.findByMultipleConditions(
  //       searchCriteria,
  //     );
  //   return result;
  // }

  // @Get('relations')
  // findAllWthRelations(@Query() searchCriteria: FindCurrentTelemetryDto) {
  //   const relationsRequired = true;
  //   return this.currentTelemetryPayloadService.findAll(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Get('relations/:id')
  // findOneByIdWithRelations(@Param('id') id: string) {
  //   return this.currentTelemetryPayloadService.findOneByIdWthRelations(id);
  // }

  // @Get(':id')
  // findOneById(@Param('id') id: string) {
  //   return this.currentTelemetryPayloadService.findOneById(id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCurrentTelemetryPayloadDto: UpdateCurrentTelemetryDto,
  // ) {
  //   return this.currentTelemetryPayloadService.update(
  //     id,
  //     updateCurrentTelemetryPayloadDto,
  //   );
  // }
  

  // @Patch('restore/:id')
  // restore(@Param('id') id: string) {
  //   return this.currentTelemetryPayloadService.restore(id);
  // }

  // @Delete('deviceGroupForAPeriod')
  // deleteDeviceGroupForTimePeriod(
  //   @Query() deleteCriteria: FindCurrentTelemetryForAPeriod,
  // ) {
  //   return this.currentTelemetryPayloadService.deleteDeviceGroupForTimePeriod(
  //     deleteCriteria,
  //   );
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.currentTelemetryPayloadService.delete(id);
  // }

  // @Delete('softDelete/:id')
  // softDelete(@Param('id') id: string) {
  //   return this.currentTelemetryPayloadService.softDelete(id);
  // }
}
