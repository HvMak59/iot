import { Injectable } from '@nestjs/common';
import { CreateMetricsAttributeDto } from './dto/create-metrics-attribute.dto';
import { UpdateMetricsAttributeDto } from './dto/update-metrics-attribute.dto';

import serviceConfig from 'src/app_config/service.config.json';
import { InjectRepository } from '@nestjs/typeorm';
import { MetricsAttribute } from './entities/metrics-attribute.entity';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { FindMetricsAttributeDto } from './dto/find-metrics-attribute.dto';
import _ from 'lodash';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import {
  KEY_SEPARATOR,
  DUPLICATE_RECORD,
  NO_RECORD,
} from 'src/app_config/constants';
import { MetricsFrequency, MetricType } from 'src/utils/enums';

@Injectable()
export class MetricsAttributeService {
  // private eagerRelations = serviceConfig.metricsAttribute.eagerRelations;
  // private relations = serviceConfig.metricsAttribute.relations;
  // private combinedRelations = _.union(this.relations, this.eagerRelations);
  private readonly logger = winstonServerLogger(MetricsAttributeService.name);
  constructor(
    @InjectRepository(MetricsAttribute)
    private readonly repo: Repository<MetricsAttribute>,
  ) { }
  async create(createMetricsAttributeDto: CreateMetricsAttributeDto) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(CreateMetricsAttributeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.findOneBy({
      id: createMetricsAttributeDto.id,
    });

    if (result) {
      this.logger.error(
        `${fnName} : ${DUPLICATE_RECORD} : ${result.id} already exists`,
      );
      throw new Error(`${DUPLICATE_RECORD} : ${result.id} already exists`);
    } else {
      const metricsAttributeObj = this.repo.create(createMetricsAttributeDto);
      this.logger.debug(
        `${fnName} : Created MetricsAttribute is : ${JSON.stringify(
          metricsAttributeObj,
        )}`,
      );

      return await this.repo.save(metricsAttributeObj);
    }
  }

  async update(
    id: string,
    updateMetricsAttributeDto: UpdateMetricsAttributeDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id} and update object : ${JSON.stringify(
      updateMetricsAttributeDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateMetricsAttributeDto.id == null) {
      this.logger.debug(
        `${fnName} : MetricsAttribute Id not found in updateMetricsAttributeDto`,
      );
      updateMetricsAttributeDto.id = id;
    } else if (updateMetricsAttributeDto.id != id) {
      this.logger.error(
        `${fnName} : MetricsAttribute Id : ${id} and Update MetricsAttribute object Id : ${updateMetricsAttributeDto.id} do not match`,
      );
      throw new Error(
        `MetricsAttribute Id : ${id} and Update MetricsAttribute object Id : ${updateMetricsAttributeDto.id} do not match`,
      );
    }

    const mergedMetricsAttribute = await this.repo.preload(
      updateMetricsAttributeDto,
    );
    if (mergedMetricsAttribute == null) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : MetricsAttribute Id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : MetricsAttribute Id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} : Merged MetricsAttribute is : ${JSON.stringify(
          mergedMetricsAttribute,
        )}`,
      );

      return await this.repo.save(mergedMetricsAttribute);
    }
  }

  async findAll(
    searchCriteria: FindMetricsAttributeDto,
    relationsRequired: boolean = false,
  ) {
    //const msgTemplate = 'Find ' + this.serviceName + 's';
    // const relations = relationsRequired
    //   ? this.combinedRelations
    //   : this.eagerRelations;
    const result = await this.repo.find({
      where: searchCriteria as FindOptionsWhere<MetricsAttribute>,
      // relations: relations,
      order: {
        id: 'ASC',
      },
    });
    return result;
    /* return findAll<MetricsAttribute>(
      this.repo,
      msgTemplate,
      relations,
      searchCriteria,
    ); */
  }

  findOneBy(
    searchCriteria: FindMetricsAttributeDto,
    relationsRequired: boolean = false,
  ) {
    //const msgTemplate = 'Find ' + this.serviceName + 's';
    // const relations = relationsRequired
    //   ? this.combinedRelations
    //   : this.eagerRelations;
    return this.repo.findOneBy(
      searchCriteria as FindOptionsWhere<MetricsAttribute>,
    );
  }

  findOneById(id: string, relationsRequired: boolean = true) {
    const fnName = this.findOneById.name;
    const input = `Input : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    //
    // const relations = relationsRequired
    //   ? this.combinedRelations
    //   : this.eagerRelations;

    return this.repo.findOne({ where: { id: id }, });
  }

  async fetchMetricsAttrFromAsset(assetId: string) {
    const fnName = this.fetchMetricsAttrFromAsset.name;
    this.logger.debug(
      `${fnName}: Fetching metricsAttributes for AssetId: ${assetId}`,
    );

    /* const metricsAttributes = await this.repo
      .createQueryBuilder('ma')
      .select(['ma.id', 'ma.description', 'ma.frequency', 'vd.deviceTypeId'])
      .innerJoin('ma.deviceTypeMetricsAttributes', 'dtma')
      .innerJoin('virtual_device', 'vd', 'dtma.deviceTypeId = vd.deviceTypeId')
      .where('vd.assetId = :assetId', { assetId })
      .andWhere('dtma.displayOrder IS NOT NULL')
      .getMany(); */

    const metricsAttributes = await this.repo
      .createQueryBuilder('ma')
      .select([
        'ma.id AS id',
        'ma.description AS description',
        'ma.frequency AS frequency',
        'dtma.deviceTypeId AS deviceTypeId',
      ])
      .distinct(true)
      .innerJoin('ma.deviceTypeMetricsAttributes', 'dtma')
      .innerJoin('virtual_device', 'vd', 'dtma.deviceTypeId = vd.deviceTypeId')
      .where('vd.assetId = :assetId', { assetId })
      .andWhere('dtma.displayOrder IS NOT NULL')
      // .getMany();
      .getRawMany();

    this.logger.debug(
      `${fnName}: Fetched metricsAttributes are : ${JSON.stringify(
        metricsAttributes,
      )}`,
    );

    return metricsAttributes;
  }

  metricsToBeCalculated() {
    return this.repo.find(
      {
        where: {
          metricType: MetricType.calculated,
          paramMetricsAttributeId: Not(IsNull()),
          mathOperator: Not(IsNull()),
          frequency: Not(MetricsFrequency.INSTANT),
        },
        relations: {
          // assetCurrentPerformanceSources: true
        }
      })
  }

  async delete(id: string) {
    const fnName = this.delete.name;
    const input = `Input : MetricsAttribute id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const metricsAttribute = await this.findOneById(id, true);

    // if (
    //   // metricsAttribute &&
    //   // ((metricsAttribute.groupMetricsAttributes != null &&
    //   //   metricsAttribute.groupMetricsAttributes.length > 0) ||
    //   //   (metricsAttribute.deviceMetricsAttributeFormulas != null &&
    //   //     metricsAttribute.deviceMetricsAttributeFormulas.length > 0) ||
    //   //   (metricsAttribute.deviceModelAttributes != null &&
    //   //     metricsAttribute.deviceModelAttributes.length > 0) ||
    //   //   (metricsAttribute.assetCurrentPerformanceSources != null &&
    //   //     metricsAttribute.assetCurrentPerformanceSources.length > 0))
    //   // || metricAttribute.deviceTypeMetricsAttributes.length > 0
    // ) {
    //   this.logger.error(
    //     `${fnName} : Can not delete MetricAttribute id : ${id}`,
    //   );
    //   throw new Error(
    //     `Can not delete MetricAttribute id : ${id} with relations`,
    //   );
    // } else {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new Error(
        `${fnName} : ${NO_RECORD} : MetricsAttribute id : ${id} not found`,
      );
    } else {
      this.logger.debug(
        `${fnName} : MetricsAttribute id : ${id} deleted successfully`,
      );
      return result;
    }
    // }
  }

  async softDelete(id: string, metricAttributeToBeDeleted: MetricsAttribute) {
    const fnName = this.softDelete.name;
    const input = `Input : MetricsAttribute id : ${id} to be softDeleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    /* To save deletedBy field */
    const metricsAttribute = await this.repo.save(metricAttributeToBeDeleted);

    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : MetricsAttribute with id : ${id} not found`,
      );
      throw new Error(
        `${NO_RECORD} : MetricsAttribute with id : ${id} not found`,
      );
    } else {
      this.logger.debug(
        `${fnName} : MetricsAttribute with id : ${id} softDeleted successfully`,
      );
      return result;
    }
  }

  async restore(id: string, userId: string) {
    const fnName = this.restore.name;
    const input = `Input : MetricsAttribute id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    this.logger.debug(fnName);
    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : MetricsAttribute id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : MetricsAttribute id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} : MetricsAttribute id : ${id} restored successfully`,
      );
      let restored = await this.findOneById(id);
      restored!.deletedBy = undefined;
      return await this.repo.save(restored!);
    }
  }
}
