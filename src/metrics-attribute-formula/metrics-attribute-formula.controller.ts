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
import { Response } from 'express';
import { MetricsAttributeFormulaService } from './metrics-attribute-formula.service';
import { CreateMetricsAttributeFormulaDto } from './dto/create-metrics-attribute-formula.dto';
import { FindMetricsAttributeFormulaDto } from './dto/find-metrics-attribute-formula.dto';
import { FindMetricsAttributeFormulaByMultipleIDsDto } from './dto/find-metrics-attribute-formulas-byMultipleIDs.dto';
import { UpdateMetricsAttributeFormulaDto } from './dto/update-metrics-attribute-formula.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';

@Controller('metrics-attribute-formula')
export class MetricsAttributeFormulaController {
  private readonly logger = winstonServerLogger(
    MetricsAttributeFormulaController.name,
  );
  constructor(
    private readonly metricsAttributeFormulaService: MetricsAttributeFormulaService,
  ) { }

  // @Post()
  // create(
  //   @Body()
  //   createMetricsAttributeFormulaDto: CreateMetricsAttributeFormulaDto,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   return this.metricsAttributeFormulaService.create(
  //     createMetricsAttributeFormulaDto,
  //     response,
  //   );
  // }

  // @Get('byMultipleIDs')
  // getByMultipleIDs(
  //   @Query()
  //   findCriteria: FindMetricsAttributeFormulaByMultipleIDsDto,
  // ) {
  //   const fnName = this.getByMultipleIDs.name;
  //   const input = JSON.stringify(findCriteria);
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return this.metricsAttributeFormulaService.findAllByMultipleIDs(
  //     findCriteria,
  //   );
  // }

  // @Get('byMultipleIDs/relations')
  // getByMultipleIDsWithRelations(
  //   @Query()
  //   findCriteria: FindMetricsAttributeFormulaByMultipleIDsDto,
  // ) {
  //   const fnName = this.getByMultipleIDsWithRelations.name;
  //   const input = JSON.stringify(findCriteria);
  //   this.logger.debug(`${fnName} : ${input}`);
  //   const relationsRequired = true;
  //   return this.metricsAttributeFormulaService.findAllByMultipleIDs(
  //     findCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Get()
  // findAll(@Query() searchCriteria: FindMetricsAttributeFormulaDto) {
  //   this.logger.debug('findAll');
  //   return this.metricsAttributeFormulaService.findAll(searchCriteria);
  // }

  // @Get('relations')
  // findAllWthRelations(@Query() searchCriteria: FindMetricsAttributeFormulaDto) {
  //   const relationsRequired = true;
  //   return this.metricsAttributeFormulaService.findAll(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // /* @Get('relations/:id')
  // findOneByIdWithRelations(@Query('id') id: string) {
  //   const relationsRequired = true;
  //   return this.metricsAttributeFormulaService.findOneById(
  //     id,
  //     relationsRequired,
  //   );
  // } */

  // @Get('one')
  // findOneById(@Query('id') id: string) {
  //   return this.metricsAttributeFormulaService.findOneById(id);
  // }

  // @Get('formulaInvolvingMetricIDs')
  // async findFormulaInvolvingMetricId(@Query('csvMetricIDs') csvMetricIDs: string) {
  //   const fnName = this.findFormulaInvolvingMetricId.name;
  //   this.logger.debug(`${fnName} : Input : ${csvMetricIDs}`);
  //   return await this.metricsAttributeFormulaService.findFormulaInvolvingMetricIDs(
  //     csvMetricIDs,
  //   );
  // }

  // @Patch()
  // update(
  //   @Query('id') id: string,
  //   @Body()
  //   updateMetricsAttributeFormulaDto: UpdateMetricsAttributeFormulaDto,
  // ) {
  //   return this.metricsAttributeFormulaService.update(
  //     id,
  //     updateMetricsAttributeFormulaDto,
  //   );
  // }

  // @Patch('restore/:id')
  // restore(@Param('id') id: string) {
  //   return this.metricsAttributeFormulaService.restore(id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.metricsAttributeFormulaService.delete(id);
  // }

  // @Delete('softDelete/:id')
  // softDelete(@Param('id') id: string) {
  //   return this.metricsAttributeFormulaService.softDelete(id);
  // }
}
