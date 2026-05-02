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
import { MetricsAttributeAggregationService } from './metrics-attribute-aggregation.service';
import { CreateMetricsAttributeAggregationDto } from './dto/create-metrics-attribute-aggregation.dto';
import { FindMetricsAttributeAggregationDto } from './dto/find-metrics-attribute-aggregation.dto';
import { UpdateMetricsAttributeAggregationDto } from './dto/update-metrics-attribute-aggregation.dto';

@Controller('metrics-attribute-aggregation')
export class MetricsAttributeAggregationController {
  constructor(
    private readonly metricsAttributeAggregationService: MetricsAttributeAggregationService,
  ) { }

  //   @Post()
  //   create(
  //     @Body()
  //     metricsAttributeAggregationDto: CreateMetricsAttributeAggregationDto,
  //     @Res({ passthrough: true }) response: Response,
  //   ) {
  //     return this.metricsAttributeAggregationService.create(
  //       metricsAttributeAggregationDto,
  //       response,
  //     );
  //   }

  //   @Get()
  //   findAll(@Query() searchCriteria: FindMetricsAttributeAggregationDto) {
  //     return this.metricsAttributeAggregationService.findAll(searchCriteria);
  //   }

  //   @Get('relations')
  //   findAllWthRelations(
  //     @Query() searchCriteria: FindMetricsAttributeAggregationDto,
  //   ) {
  //     const relationsRequired = true;
  //     return this.metricsAttributeAggregationService.findAll(
  //       searchCriteria,
  //       relationsRequired,
  //     );
  //   }

  //   @Get(':id')
  //   findOneById(@Param('id') id: string) {
  //     return this.metricsAttributeAggregationService.findOneById(id);
  //   }

  //   @Get('relations/:id')
  //   findOneByIdWithRelations(@Param('id') id: string) {
  //     return this.metricsAttributeAggregationService.findOneByIdWthRelations(id);
  //   }

  //   @Patch(':id')
  //   update(
  //     @Param('id') id: string,
  //     @Body()
  //     updateMetricsAttributeAggregationDto: UpdateMetricsAttributeAggregationDto,
  //   ) {
  //     return this.metricsAttributeAggregationService.update(
  //       id,
  //       updateMetricsAttributeAggregationDto,
  //     );
  //   }

  //   @Patch('restore/:id')
  //   restore(@Param('id') id: string) {
  //     return this.metricsAttributeAggregationService.restore(id);
  //   }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.metricsAttributeAggregationService.delete(id);
  //   }

  //   @Delete('softDelete/:id')
  //   softDelete(@Param('id') id: string) {
  //     return this.metricsAttributeAggregationService.softDelete(id);
  //   }
}
