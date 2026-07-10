import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGroupMetricsAttributeAggregationDto } from './dto/create-group-metrics-attribute-aggregation.dto';
import { UpdateGroupMetricsAttributeAggregationDto } from './dto/update-group-metrics-attribute-aggregation.dto';

import serviceConfig from 'src/app_config/service.config.json';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupMetricsAttributeAggregation } from './entities/group-metrics-attribute-aggregation.entity';
import { In, Repository } from 'typeorm';
import { Response } from 'express';
import {
  // getGroupIDFromGroupMetricsAttribAgg,
  // getMetricsAttribAggregationFromGroupMetricsAttribAgg,
  getTryCatchErrorStr,
} from 'src/utils/others';
import { FindGroupMetricsAttributeAggregationDto } from './dto/find-group-metrics-attribute-aggregation.dto';
import _ from 'lodash';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';

@Injectable()
export class GroupMetricsAttributeAggregationService {
  private serviceName = ''
  // serviceConfig.groupMetricsAttributeAggregation.serviceName;
  private relations = [];
  // private relations = serviceConfig.groupMetricsAttributeAggregation.relations;
  private logger = winstonServerLogger(
    GroupMetricsAttributeAggregationService.name,
  );

  constructor(
    @InjectRepository(GroupMetricsAttributeAggregation)
    private readonly repo: Repository<GroupMetricsAttributeAggregation>,
  ) { }

  async create(
    createGroupMetricsAttributeAggregationDto: CreateGroupMetricsAttributeAggregationDto,
    response: Response,
  ) {
    const msgTemplate = 'Insert' + this.serviceName;
    try {
      let result;
      result = await this.repo.findOne({
        where: {
          // groupId: createGroupMetricsAttributeAggregationDto.groupId,
          // metricsAttributeAggregationId:
          //   createGroupMetricsAttributeAggregationDto.metricsAttributeAggregationId,
        },
      });
      if (result) {
        this.logger.debug(
          `${msgTemplate} : ${JSON.stringify(
            createGroupMetricsAttributeAggregationDto,
          )} already exists`,
        );
        response.sendStatus(HttpStatus.OK);
      } else {
        result = await this.repo.insert(
          createGroupMetricsAttributeAggregationDto,
        );
        this.logger.debug(`${msgTemplate} : ${JSON.stringify(result)} created`);
        return result;
      }
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(
        `${msgTemplate} : ${errMsg} : Error while processing ${JSON.stringify(
          createGroupMetricsAttributeAggregationDto,
        )}`,
      );
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${msgTemplate} : 
      End`);
    }
  }

  async findByGroupIds(groupIds: string[]): Promise<GroupMetricsAttributeAggregation[]> {
    if (!groupIds.length) return [];
    return this.repo.find({
      where: { groupId: In(groupIds) },
      relations: ['metricsAttributeAggregation'],
    });
  }





  async getAggregationRules(
    groupId: string,
  ): Promise<GroupMetricsAttributeAggregation[]> {

    const fnName = 'getAggregationRules()';

    try {

      this.logger.debug(`${fnName} : Start`);

      const rules = await this.repo.find({

        where: {
          groupId,
        },

        relations: {
          metricsAttributeAggregation: true,
        },

      });

      this.logger.debug(
        `${fnName} : ${rules.length} aggregation rules found`,
      );

      return rules;

    } catch (error) {

      this.logger.error(
        `${fnName} : ${error.message}`,
      );

      throw error;

    } finally {

      this.logger.debug(`${fnName} : End`);

    }

  }


  createBulk(
    createGroupMetricsAttributeAggregationDTOs: CreateGroupMetricsAttributeAggregationDto[],
  ) {
    const fnName = this.createBulk.name;
    const input = `Input : ${JSON.stringify([
      ...createGroupMetricsAttributeAggregationDTOs,
    ])}`;
    this.logger.info(`${fnName} : Start`);
    this.logger.debug(`${fnName} : ${input}`);
    return this.repo.save(createGroupMetricsAttributeAggregationDTOs);
  }

  async findAll(
    searchCriteria: FindGroupMetricsAttributeAggregationDto,
    relationsRequired: boolean = true,
  ) {
    const msgTemplate = `findAllDeviceGroups() : Input : ${JSON.stringify(
      searchCriteria,
    )}`;
    try {
      this.logger.info(`${msgTemplate} : Start`);
      let relations = relationsRequired ? this.relations : [];
      const result = await this.repo.find({
        where: searchCriteria,
        relations: ["metricsAttributeAggregation"],
      });
      this.logger.debug(
        `${msgTemplate} : Output : Resulting all Groups- MetricsAttributeAggregation : ${JSON.stringify(
          result,
        )}`,
      );
      return result;
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(
        `${msgTemplate} : ${errMsg} : Error while processing ${JSON.stringify(
          searchCriteria,
        )}`,
      );
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.info(`${msgTemplate} : End.`);
    }
  }

  async findByCSVGroupIDs(
    csvGroupIDs: string,
    relationsRequired: boolean = false,
  ) {
    const fnIdentifier = `findByCSVGroupIDs()`;
    try {
      this.logger.info(`${fnIdentifier} : Start : ${csvGroupIDs}`);
      const relations = relationsRequired ? this.relations : [];
      const result = await this.repo.find({
        where: { groupId: In(csvGroupIDs.split(',')) },
        relations: relations,
      });
      return result;
      /* const groupedResult = _.groupBy(
        result,
        getGroupIDFromGroupMetricsAttribAgg,
      );
      const groupIDWithMetricsAttributeAggregationList = _.mapValues(
        groupedResult,
        (record) =>
          _.map(record, getMetricsAttribAggregationFromGroupMetricsAttribAgg),
      );
      this.logger.log(
        `${fnIdentifier} : Output : Resulting  Groups- MetricsAttributeAggregation  : ${JSON.stringify(
          groupIDWithMetricsAttributeAggregationList,
        )}`,
      );
      return groupIDWithMetricsAttributeAggregationList; */
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnIdentifier} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.info(`${fnIdentifier} : End.`);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} groupMetricsAttributeAggregation`;
  }

  update(
    id: number,
    updateGroupMetricsAttributeAggregationDto: UpdateGroupMetricsAttributeAggregationDto,
  ) {
    return `This action updates a #${id} groupMetricsAttributeAggregation`;
  }

  remove(id: number) {
    return `This action removes a #${id} groupMetricsAttributeAggregation`;
  }
}
