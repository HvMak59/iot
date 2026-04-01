import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Not, Repository, Unique } from 'typeorm';
import { Response } from 'express';
// import {
//   findAll,
//   deleteRec,
//   softDelete,
//   restore,
// } from '../../utils/cmnFn.repository';

import serviceConfig from 'src/app_config/service.config.json';

import { MetricsAttributeFormula } from './entities/metrics-attribute-formula.entity';
import { CreateMetricsAttributeFormulaDto } from './dto/create-metrics-attribute-formula.dto';
import { UpdateMetricsAttributeFormulaDto } from './dto/update-metrics-attribute-formula.dto';
import { FindMetricsAttributeFormulaDto } from './dto/find-metrics-attribute-formula.dto';
import { FindMetricsAttributeFormulaByMultipleIDsDto } from './dto/find-metrics-attribute-formulas-byMultipleIDs.dto';
import _ from 'lodash';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { MetricsFrequency, MetricType } from 'src/utils/enums';
import { FindMetricsAttributeDto } from 'src/metrics-attribute/dto/find-metrics-attribute.dto';

@Injectable()
export class MetricsAttributeFormulaService {
  // private serviceName = serviceConfig.metricsAttributeFormula.serviceName;
  private serviceName = '';
  // private eagerRelations = serviceConfig.metricsAttributeFormula.eagerRelations;
  // private relations = serviceConfig.metricsAttributeFormula.relations;
  // private combinedRelations = _.union(this.relations, this.eagerRelations);
  private readonly logger = winstonServerLogger(
    MetricsAttributeFormulaService.name,
  );
  constructor(
    @InjectRepository(MetricsAttributeFormula)
    private readonly repo: Repository<MetricsAttributeFormula>,
  ) { }

  // async create(
  //   createMetricsAttributeFormulaDto: CreateMetricsAttributeFormulaDto,
  //   response: Response,
  // ) {
  //   const msgTemplate = 'Insert ' + this.serviceName;
  //   try {
  //     let result;
  //     result = await this.repo.findOneBy({
  //       metricsAttribute: {
  //         id: createMetricsAttributeFormulaDto.metricsAttribute?.id,
  //       },
  //       expression: createMetricsAttributeFormulaDto.expression,
  //     });
  //     if (result) {
  //       this.logger.info(`${msgTemplate} : ${result.id} already exists`);
  //       response.status(HttpStatus.OK); //.json(org);
  //     } else {
  //       result = await this.repo.save(createMetricsAttributeFormulaDto);
  //       this.logger.info(`${msgTemplate} : ${JSON.stringify(result)} created`);
  //     }
  //     return result;
  //   } catch (error) {
  //     this.logger.error(
  //       `${msgTemplate} : ${createMetricsAttributeFormulaDto} : ${error}`,
  //     );
  //     throw new Error(error as string);
  //   }
  // }

  // findAll(
  //   searchCriteria: FindMetricsAttributeFormulaDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const msgTemplate = 'Find ' + this.serviceName + 's';
  //   let relations = relationsRequired
  //     ? this.combinedRelations
  //     : this.eagerRelations;
  //   return findAll<MetricsAttributeFormula>(
  //     this.repo,
  //     msgTemplate,
  //     relations,
  //     searchCriteria,
  //   );
  // }

  // /* findAllByCSVDeviceModelIDs(
  //   csvDeviceModelIDs: string,
  //   relationsRequired: boolean = false,
  // ) {
  //   const msgTemplate = 'Find ' + this.serviceName + 's';
  //   let relations = relationsRequired
  //     ? serviceConfig.deviceMetricsAttributeFormula.relations
  //     : [];
  //   this.logger.debug(`${msgTemplate} : Input : ${csvDeviceModelIDs}`);
  //   const searchObject: FindDeviceMetricsAttributeFormulaDto = {
  //     deviceModels: {
  //       id: In(csvDeviceModelIDs.split(',')),
  //     },
  //   };
  //   return this.findAll(searchObject, relationsRequired);
  // } */

  // findAllByMultipleIDs(
  //   findCriteria: FindMetricsAttributeFormulaByMultipleIDsDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const msgTemplate = 'Find ' + this.serviceName + 's';
  //   this.logger.debug(
  //     `${msgTemplate} : Input : ${JSON.stringify(findCriteria)}`,
  //   );
  //   let searchObject: FindMetricsAttributeFormulaDto = {};
  //   if (findCriteria.csvDeviceModelIDs && findCriteria.csvMetricsAttributeIDs) {
  //     searchObject = {
  //       deviceModelMetricsAttributeFormulas: {
  //         deviceModelId: In(findCriteria.csvDeviceModelIDs.split(',')),
  //       },
  //       metricsAttributeId: In(findCriteria.csvMetricsAttributeIDs.split(',')),
  //     };
  //   } else if (findCriteria.csvDeviceModelIDs) {
  //     searchObject = {
  //       deviceModelMetricsAttributeFormulas: {
  //         deviceModelId: In(findCriteria.csvDeviceModelIDs.split(',')),
  //       },
  //     };
  //   } else if (findCriteria.csvMetricsAttributeIDs) {
  //     searchObject = {
  //       metricsAttributeId: In(findCriteria.csvMetricsAttributeIDs.split(',')),
  //     };
  //   }
  //   return this.findAll(searchObject, relationsRequired);
  // }

  // /* findAllWthRelations() {
  //   const msgTemplate = 'Find ' + this.serviceName + 's' + ' with relations';
  //   return findAll<DeviceMeasurement>(
  //     this.repo,
  //     msgTemplate,
  //     serviceConfig.deviceMeasurement.relations,
  //   );
  // } */

  // async findOneById(id: string, relationsRequired = false) {
  //   const msgTemplate = 'Find ' + this.serviceName;
  //   //return findOne<DeviceMeasurement>(this.repo, id, msgTemplate, "asset-type");
  //   try {
  //     return await this.repo.findOne({
  //       where: { id: id },
  //       relations: relationsRequired
  //         ? this.combinedRelations
  //         : this.eagerRelations,
  //     });
  //   } catch (error) {
  //     this.logger.error(`${msgTemplate} : ${id} : ${error}`);
  //     throw new Error(error as string);
  //   }
  // }

  // /* async findOneByIdWthRelations(id: string) {
  //   const msgTemplate = 'Find ' + this.serviceName + ' with relations';
  //   //return findOne<DeviceMeasurement>(this.repo, id, msgTemplate, "asset-type", "asset");
  //   try {
  //     return await this.repo.findOne({
  //       where: {
  //         id: id,
  //       },
  //       relations: serviceConfig.deviceMetricsAttributeFormula.relations,
  //     });
  //   } catch (error) {
  //     this.logger.error(`${msgTemplate} : ${id} : ${error}`);
  //     throw new Error(error as string);
  //   }
  // } */

  // async findFormulaInvolvingMetricIDs(csvMetricIDs: string) {
  //     if (!csvMetricIDs || !csvMetricIDs.length) return [];

  //     csvMetricIDs = csvMetricIDs.trim();
  //     const metricIds = csvMetricIDs.split(',').map(id => id.trim());

  //     return await this.repo.find({
  //       where: metricIds.map(metricId => ({
  //           metricsAttribute: {
  //               metricType: MetricType.calculated,
  //               frequency: Not(MetricsFrequency.INSTANT),
  //               paramMetricsAttributeId: IsNull(),
  //               mathOperator: IsNull(),
  //           },
  //           expression: Like(`%${metricId}%`)
  //       })),
  //       relations: {
  //           metricsAttribute: true
  //       },
  //       order: { calculationSeq: 'ASC' }
  //   });
  // }

  // async update(
  //   id: string,
  //   updateMetricsAttributeFormulaDto: UpdateMetricsAttributeFormulaDto,
  // ) {
  //   const msgTemplate = 'Update ' + this.serviceName;
  //   try {
  //     const result = await this.repo.save(updateMetricsAttributeFormulaDto);
  //     /*if (result.affected === 0) {
  //       this.logger.debug(`${msgTemplate} : ${id} does not exist`);
  //     } else this.logger.info(`${msgTemplate} : ${id} updated `); */
  //     return result;
  //   } catch (error) {
  //     this.logger.error(`${msgTemplate} ${id} : ${error}`);
  //     throw new Error(error as string);
  //   }
  // }

  // delete(id: string) {
  //   const msgTemplate = 'Delete ' + this.serviceName;
  //   return deleteRec<MetricsAttributeFormula>(this.repo, id, msgTemplate);
  // }

  // softDelete(id: string) {
  //   const msgTemplate = 'Soft delete ' + this.serviceName;
  //   return softDelete<MetricsAttributeFormula>(this.repo, id, msgTemplate);
  // }

  // restore(id: string) {
  //   const msgTemplate = 'Restore ' + this.serviceName;
  //   return restore<MetricsAttributeFormula>(this.repo, id, msgTemplate);
  // }
}
