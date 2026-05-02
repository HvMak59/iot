import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
// import {
//   findAll,
//   deleteRec,
//   softDelete,
//   restore,
// } from 'src/utils/cmnFn.repository';

import serviceConfig from 'src/app_config/service.config.json';

import { MetricsAttributeAggregation } from './entities/metrics-attribute-aggregation.entity';
import { CreateMetricsAttributeAggregationDto } from './dto/create-metrics-attribute-aggregation.dto';
import { UpdateMetricsAttributeAggregationDto } from './dto/update-metrics-attribute-aggregation.dto';
import { FindMetricsAttributeAggregationDto } from './dto/find-metrics-attribute-aggregation.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';

@Injectable()
export class MetricsAttributeAggregationService {
  private serviceName = '';
  // private serviceName = serviceConfig.metricsAttributeAggregation.serviceName;
  private readonly logger = winstonServerLogger(
    MetricsAttributeAggregationService.name,
  );
  constructor(
    @InjectRepository(MetricsAttributeAggregation)
    private readonly repo: Repository<MetricsAttributeAggregation>,
  ) { }

  async create(
    createMetricsAttributeAggregationDto: CreateMetricsAttributeAggregationDto,
    response: Response,
  ) {
    const msgTemplate = 'Insert ' + this.serviceName;
    try {
      let result;
      result = await this.repo.findOneBy({
        metricsAttributeId:
          createMetricsAttributeAggregationDto.metricsAttributeId,
        aggregation: createMetricsAttributeAggregationDto.aggregation,
        aggStrategy: createMetricsAttributeAggregationDto.aggStrategy,
      });
      if (result) {
        this.logger.info(`${msgTemplate} : ${result.id} already exists`);
        response.status(HttpStatus.OK); //.json(org);
      } else {
        const metricsAttributeAggregationObj = this.repo.create(
          createMetricsAttributeAggregationDto,
        );
        result = await this.repo.save(metricsAttributeAggregationObj);
        this.logger.info(`${msgTemplate} : ${JSON.stringify(result)} created`);
      }
      return result;
    } catch (error) {
      this.logger.error(
        `${msgTemplate} : ${createMetricsAttributeAggregationDto} : ${error}`,
      );
      throw new Error(error as string);
    }
  }


  // metrics-attribute-aggregation.service.ts

  async find(options: any) {
    return this.repo.find(options);
  }

  async findOne(options: any) {
    return this.repo.findOne(options);
  }


  // findAll(
  //   searchCriteria: FindMetricsAttributeAggregationDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const msgTemplate = 'Find ' + this.serviceName + 's';
  //   let relations = relationsRequired
  //     ? serviceConfig.metricsAttributeAggregation.relations
  //     : [];
  //   return findAll<MetricsAttributeAggregation>(
  //     this.repo,
  //     msgTemplate,
  //     relations,
  //     searchCriteria,
  //   );
  // }

  // /* findAllWthRelations() {
  //   const msgTemplate = 'Find ' + this.serviceName + 's' + ' with relations';
  //   return findAll<DeviceInstanceGroupMeasurement>(
  //     this.repo,
  //     msgTemplate,
  //     serviceConfig.deviceInstanceGroupMeasurement.relations,
  //   );
  // } */

  // async findOneById(id: string) {
  //   const msgTemplate = 'Find ' + this.serviceName;
  //   //return findOne<DeviceInstanceGroupMeasurement>(this.repo, id, msgTemplate, "asset-type");
  //   try {
  //     return await this.repo.findOne({ where: { id: id } });
  //   } catch (error) {
  //     this.logger.error(`${msgTemplate} : ${id} : ${error}`);
  //     throw new Error(error as string);
  //   }
  // }

  // async findOneByIdWthRelations(id: string) {
  //   const msgTemplate = 'Find ' + this.serviceName + ' with relations';
  //   //return findOne<DeviceInstanceGroupMeasurement>(this.repo, id, msgTemplate, "asset-type", "asset");
  //   try {
  //     return await this.repo.findOne({
  //       where: {
  //         id: id,
  //       },
  //       relations: serviceConfig.metricsAttributeAggregation.relations,
  //     });
  //   } catch (error) {
  //     this.logger.error(`${msgTemplate} : ${id} : ${error}`);
  //     throw new Error(error as string);
  //   }
  // }

  // async update(
  //   id: string,
  //   updateGroupMetricsAttributeDto: UpdateMetricsAttributeAggregationDto,
  // ) {
  //   const msgTemplate = 'Update ' + this.serviceName;
  //   try {
  //     const result = await this.repo.update(id, updateGroupMetricsAttributeDto);
  //     if (result.affected === 0) {
  //       this.logger.debug(`${msgTemplate} : ${id} does not exist`);
  //     } else this.logger.info(`${msgTemplate} : ${id} updated `);
  //     return result;
  //   } catch (error) {
  //     this.logger.error(`${msgTemplate} ${id} : ${error}`);
  //     throw new Error(error as string);
  //   }
  // }

  // delete(id: string) {
  //   const msgTemplate = 'Delete ' + this.serviceName;
  //   return deleteRec<MetricsAttributeAggregation>(this.repo, id, msgTemplate);
  // }

  // softDelete(id: string) {
  //   const msgTemplate = 'Soft delete ' + this.serviceName;
  //   return softDelete<MetricsAttributeAggregation>(this.repo, id, msgTemplate);
  // }

  // restore(id: string) {
  //   const msgTemplate = 'Restore ' + this.serviceName;
  //   return restore<MetricsAttributeAggregation>(this.repo, id, msgTemplate);
  // }
}
