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
import { GroupMetricsAttributeAggregationService } from './group-metrics-attribute-aggregation.service';
import { CreateGroupMetricsAttributeAggregationDto } from './dto/create-group-metrics-attribute-aggregation.dto';
import { UpdateGroupMetricsAttributeAggregationDto } from './dto/update-group-metrics-attribute-aggregation.dto';
import { Response } from 'express';
import { FindGroupMetricsAttributeAggregationDto } from './dto/find-group-metrics-attribute-aggregation.dto';
import { Public } from 'src/auth/entities/public_route';

@Controller('group-metrics-attribute-aggregation')
export class GroupMetricsAttributeAggregationController {
  constructor(
    private readonly groupMetricsAttributeAggregationService: GroupMetricsAttributeAggregationService,
  ) { }

  //   @Post()
  //   create(
  //     @Body()
  //     createGroupMetricsAttributeAggregationDto: CreateGroupMetricsAttributeAggregationDto,
  //     @Res({ passthrough: true }) response: Response,
  //   ) {
  //     return this.groupMetricsAttributeAggregationService.create(
  //       createGroupMetricsAttributeAggregationDto,
  //       response,
  //     );
  //   }

  //   @Post('bulk')
  //   async createBulk(
  //     @Body()
  //     CreateGroupMetricsAttributeAggregationDTOs: CreateGroupMetricsAttributeAggregationDto[],
  //   ) {
  //     return await this.groupMetricsAttributeAggregationService.createBulk(
  //       CreateGroupMetricsAttributeAggregationDTOs,
  //     );
  //   }

  //   @Get()
  //   findAll(@Query() searchCriteria: FindGroupMetricsAttributeAggregationDto) {
  //     return this.groupMetricsAttributeAggregationService.findAll(searchCriteria);
  //   }

  //   @Get()
  //   findAllWthRelations(
  //     @Query() searchCriteria: FindGroupMetricsAttributeAggregationDto,
  //   ) {
  //     const relationsRequired = true;
  //     return this.groupMetricsAttributeAggregationService.findAll(
  //       searchCriteria,
  //       relationsRequired,
  //     );
  //   }

  //   @Public()
  //   @Get('byCSVGroupIDs')
  //   findByCSVGroupIDs(@Query('csvGroupIDs') csvGroupIDs: string) {
  //     return this.groupMetricsAttributeAggregationService.findByCSVGroupIDs(
  //       csvGroupIDs,
  //     );
  //   }

  //   @Public()
  //   @Get('byCSVGroupIDs/relations')
  //   findByCSVGroupIDsWthRelations(@Query('csvGroupIDs') csvGroupIDs: string) {
  //     const relationsRequired = true;
  //     return this.groupMetricsAttributeAggregationService.findByCSVGroupIDs(
  //       csvGroupIDs,
  //       relationsRequired,
  //     );
  //   }

  //   @Get(':id')
  //   findOne(@Param('id') id: string) {
  //     return this.groupMetricsAttributeAggregationService.findOne(+id);
  //   }

  //   @Patch(':id')
  //   update(
  //     @Param('id') id: string,
  //     @Body()
  //     updateGroupMetricsAttributeAggregationDto: UpdateGroupMetricsAttributeAggregationDto,
  //   ) {
  //     return this.groupMetricsAttributeAggregationService.update(
  //       +id,
  //       updateGroupMetricsAttributeAggregationDto,
  //     );
  //   }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.groupMetricsAttributeAggregationService.remove(+id);
  //   }
}
