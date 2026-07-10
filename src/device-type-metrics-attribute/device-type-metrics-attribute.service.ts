import { Injectable } from '@nestjs/common';
import { CreateDeviceTypeMetricsAttributeDto } from './dto/create-device-type-metrics-attribute.dto';
import { UpdateDeviceTypeMetricsAttributeDto } from './dto/update-device-type-metrics-attribute.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { DeviceTypeMetricsAttribute } from './entities/device-type-metrics-attribute.entity';
import { In, IsNull, Not, Repository } from 'typeorm';
import { FindDeviceTypeMetricsAttributeDto } from './dto/find-device-type-metrics-attribute.dto';

import serviceConfig from 'src/app_config/service.config.json';
// import { findAll } from 'src/utils/cmnFn.repository';
import { FindDeviceTypeMetricsAttributeByMultipleIDsDto } from './dto/find-device-type-metrics-attribute-byMultipleIDs.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import {
  DUPLICATE_RECORD,
  KEY_SEPARATOR,
  NO_RECORD,
} from 'src/app_config/constants';
import _ from 'lodash';

@Injectable()
export class DeviceTypeMetricsAttributeService {
  private relations = serviceConfig.deviceTypeMetricsAttribute.relations;
  // private relations = [];
  private logger = winstonServerLogger(DeviceTypeMetricsAttributeService.name);
  constructor(
    @InjectRepository(DeviceTypeMetricsAttribute)
    private readonly repo: Repository<DeviceTypeMetricsAttribute>,
  ) { }
  async create(
    createDeviceTypeMetricsAttributeDto: CreateDeviceTypeMetricsAttributeDto,
  ) {
    const fnName = this.create.name;
    /* const input = `Input : ${JSON.stringify(createDeviceTypeMetricsAttributeDto)}`; 

    this.logger.debug(fnName + KEY_SEPARATOR + input); */

    const deviceTypeId =
      createDeviceTypeMetricsAttributeDto.deviceTypeId ??
      createDeviceTypeMetricsAttributeDto.deviceType?.id;
    const metricsAttributeId =
      createDeviceTypeMetricsAttributeDto.metricsAttributeId ??
      createDeviceTypeMetricsAttributeDto.metricsAttribute?.id;

    const result = await this.repo.findOneBy({
      deviceTypeId: deviceTypeId,
      metricsAttributeId: metricsAttributeId,
    });

    if (result) {
      this.logger.error(
        `${fnName} : ${DUPLICATE_RECORD} : DeviceTypeMetricsAttribute with deviceTypeId : ${result.deviceTypeId} and metricsAttributeId : ${result.metricsAttributeId} already exists`,
      );
      throw new Error(
        `${DUPLICATE_RECORD} : DeviceTypeMetricsAttribute with deviceTypeId : ${result.deviceTypeId} and metricsAttributeId : ${result.metricsAttributeId} already exists`,
      );
    } else {
      const deviceTypeMetricsAttribute = this.repo.create(
        createDeviceTypeMetricsAttributeDto,
      );

      return await this.repo.save(deviceTypeMetricsAttribute);
    }
  }

  // findAll(
  //   searchCriteria: FindDeviceTypeMetricsAttributeDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   let relations = relationsRequired ? this.relations : ['metricsAttribute'];
  //   return findAll<DeviceTypeMetricsAttribute>(
  //     this.repo,
  //     this.findAll.name,
  //     relations,
  //     searchCriteria,
  //   );
  // }

  findAllWithMinimalFields(
    searchCriteria: FindDeviceTypeMetricsAttributeDto,
    //relationsRequired: boolean = false,
  ) {
    return this.repo.find({
      where: searchCriteria,
      //relations: relationsRequired ? this.relations : ['metricsAttribute'],
      select: {
        deviceTypeId: true,
        metricsAttributeId: true,
        displayOrder: true,
      },
    });
  }

  async findByMultipleIDsWithMinimalFields(
    searchCriteria: FindDeviceTypeMetricsAttributeByMultipleIDsDto,
    relationsRequired: boolean = false,
    forDisplay: boolean = false,
  ) {
    /* const event = `Input : ${JSON.stringify(searchCriteria)}`;
    const msgTemplate = 'Find ' + this.serviceName + 's'; */
    // let relations = relationsRequired ? ['metricsAttribute'] : ['metricsAttribute'];
    let relations = relationsRequired ? this.relations : ['metricsAttribute'];

    const whereCriteria: FindDeviceTypeMetricsAttributeDto = {
      deviceTypeId: In(_.uniq(searchCriteria.csvDeviceTypeIDs.split(','))),
    };
    forDisplay == true ? (whereCriteria.displayOrder = Not(IsNull())) : null;

    /* const whereCriteria: FindDeviceTypeMetricsAttributeDto = {
      deviceTypeId: In(searchCriteria.csvDeviceTypeIDs.split(',')),
      displayOrder: Not(IsNull()),
    }; */

    const dTMAs = await this.repo.find({
      select: {
        deviceTypeId: true,
        metricsAttributeId: true,
        displayOrder: true,
      },
      where: whereCriteria,
      relations: relations,
    });

    this.logger.debug(`No of records found : ${dTMAs.length}`);

    return dTMAs;
    /* return this.repo.find({
      where: whereCriteria,
      relations: relations,
      order: {
        deviceTypeId: 'ASC',
        displayOrder: 'ASC',
      },
    }); */
  }

  async dTMAsByByKey(
    searchCriteria: FindDeviceTypeMetricsAttributeByMultipleIDsDto,
    relationsRequired: boolean = false,
    forDisplay: boolean = false,
  ) {
    const dTMAs = await this.findByMultipleIDsWithMinimalFields(
      searchCriteria,
      relationsRequired,
      forDisplay,
    );
    // console.log('dtma', dTMAs);
    const dTMAByKey: _.Dictionary<DeviceTypeMetricsAttribute[]> = _.groupBy(
      dTMAs,
      (dTMA) => new DeviceTypeMetricsAttribute(dTMA).getKey(),
    );
    return dTMAByKey;
  }

  async findByMultipleIDs(
    searchCriteria: FindDeviceTypeMetricsAttributeByMultipleIDsDto,
    relationsRequired: boolean = false,
    forDisplay: boolean = false,
  ) {
    /* const event = `Input : ${JSON.stringify(searchCriteria)}`;
    const msgTemplate = 'Find ' + this.serviceName + 's'; */
    let relations = relationsRequired ? this.relations : ['metricsAttribute'];

    const whereCriteria: FindDeviceTypeMetricsAttributeDto = {
      deviceTypeId: In(_.uniq(searchCriteria.csvDeviceTypeIDs.split(','))),
    };
    forDisplay == true ? (whereCriteria.displayOrder = Not(IsNull())) : null;

    /* const whereCriteria: FindDeviceTypeMetricsAttributeDto = {
      deviceTypeId: In(searchCriteria.csvDeviceTypeIDs.split(',')),
      displayOrder: Not(IsNull()),
    }; */

    // console.log("wehre", whereCriteria);
    // console.log("in multipleid");
    const response = await this.repo.find({
      where: whereCriteria,
      relations: relations,
      order: {
        deviceTypeId: 'ASC',
        displayOrder: 'ASC',
      },
    });

    // console.log("after");
    // console.log("response", response);
    this.logger.debug(`No of records found : ${response.length}`);

    return response;
    /* return this.repo.find({
      where: whereCriteria,
      relations: relations,
      order: {
        deviceTypeId: 'ASC',
        displayOrder: 'ASC',
      },
    }); */
  }

  findMainAttrib(deviceTypeId: string) {
    return this.repo.findOne({
      where: {
        deviceTypeId: deviceTypeId,
        displayOrder: 1,
      },
      relations: {
        metricsAttribute: true,
      },
    });
  }

  // findOne(
  //   searchCriteria: FindDeviceTypeMetricsAttributeDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const relations = relationsRequired
  //     ? serviceConfig.deviceTypeMetricsAttribute.relations
  //     : ['metricsAttribute'];

  //   return this.repo.findOne({ where: searchCriteria, relations: relations });
  // }

  findOneById(id: string) {
    return this.repo.findOne({
      where: { id: id },
      relations: this.relations ?? ['metricsAttribute'],
    });
  }

  async update(
    id: string,
    updateDeviceTypeMetricsAttributeDto: UpdateDeviceTypeMetricsAttributeDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : deviceTypeMetricsAttributeId : ${updateDeviceTypeMetricsAttributeDto.id
      } and Update object : ${JSON.stringify(
        updateDeviceTypeMetricsAttributeDto,
      )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateDeviceTypeMetricsAttributeDto.id == null) {
      updateDeviceTypeMetricsAttributeDto.id = id;
    }
    if (updateDeviceTypeMetricsAttributeDto.id != id) {
      this.logger.error(
        `${fnName} : deviceTypeMetricsAttributeId : ${id} and update dto object deviceTypeMetricsAttributeId : ${updateDeviceTypeMetricsAttributeDto.id} do not match`,
      );

      throw new Error(
        `deviceTypeMetricsAttributeId : ${id} and update dto object deviceTypeMetricsAttributeId : ${updateDeviceTypeMetricsAttributeDto.id} do not match`,
      );
    }
    const mergedDeviceTypeMetricsAttribute = await this.repo.preload(
      updateDeviceTypeMetricsAttributeDto,
    );

    if (mergedDeviceTypeMetricsAttribute == null) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : DeviceTypeMetricsAttribute id : ${id} not found`,
      );
      throw new Error(
        `${NO_RECORD} : DeviceTypeMetricsAttribute id : ${id} not found`,
      );
    } else {
      this.logger.debug(
        `${fnName} : Merged DeviceTypeMetricsAttribute is : ${JSON.stringify(
          mergedDeviceTypeMetricsAttribute,
        )}`,
      );
      return await this.repo.save(mergedDeviceTypeMetricsAttribute);
    }
  }

  async delete(id: string) {
    const fnName = 'delete()';
    const input = `Input : DeviceTypeMetricAttribute id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : DeviceTypeMetricAttribute id : ${id} not found`,
      );
      throw new Error(
        `${NO_RECORD} : DeviceTypeMetricAttribute id : ${id} not found`,
      );
    } else {
      this.logger.debug(
        `${fnName} : DeviceTypeMetricAttribute id : ${id} deleted successfully`,
      );
      return result;
    }
  }

  async softDelete(
    id: string,
    deviceTypeMetricsAttributeToBeDeleted: DeviceTypeMetricsAttribute,
  ) {
    const fnName = this.softDelete.name;

    await this.repo.save(deviceTypeMetricsAttributeToBeDeleted);

    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : DeviceTypeMetricsAttribute with id : ${id} not found`,
      );
      throw new Error(
        `${NO_RECORD} : DeviceTypeMetricsAttribute with id : ${id} not found`,
      );
    } else {
      this.logger.debug(
        `${fnName} : DeviceTypeMetricsAttribute with id : ${id} softDeleted successfully`,
      );
      return result;
    }
  }

  async restore(id: string) {
    const fnName = this.restore.name;

    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : DeviceTypeMetricsAttribute id : ${id} not found`,
      );
      throw new Error(
        `${NO_RECORD} : DeviceTypeMetricsAttribute id : ${id} not found`,
      );
    } else {
      this.logger.debug(
        `${fnName} : DeviceTypeMetricsAttribute id : ${id} restored successfully`,
      );

      let restored = await this.findOneById(id);

      restored!.deletedBy = undefined;
      const result = await this.repo.save(restored!);
      return result;
    }
  }
}
