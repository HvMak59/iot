import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateDeviceModelMetricsAttributeFormulaDto } from './dto/create-device-model-metrics-attributes-formula.dto';
import { UpdateDeviceModelMetricsAttributeFormulaDto } from './dto/update-device-model-metrics-attributes-formula.dto';
import { DeviceModelMetricsAttributeFormula } from './entities/device-model-metrics-attribute-formula.entity';
import serviceConfig from 'src/app_config/service.config.json';
import _ from 'lodash';
import { Response } from 'express';
import { getTryCatchErrorStr } from 'src/utils/others';
import { FindDeviceModelMetricsAttributeFormulaDto } from './dto/find-device-model-metrics-attributes-formula.dto';
// import { findAll } from 'src/utils/cmnFn.repository';
import { FindDeviceModelMetricsAttributeFormulaByMultipleIDs } from './dto/find-device-model-metrics-attribute-formula-byMultipleIDs.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { DUPLICATE_RECORD } from 'src/app_config/constants';

@Injectable()
export class DeviceModelMetricsAttributeFormulaService {
  private serviceName = '';
  // serviceConfig.deviceModelMetricsAttributeFormula.serviceName;
  /* private eagerRelations =
    serviceConfig.deviceModelMetricsAttributeFormula.eagerRelations; */
  private readonly relations = [];
  // serviceConfig.deviceModelMetricsAttributeFormula.relations;
  private readonly logger = winstonServerLogger(
    DeviceModelMetricsAttributeFormulaService.name,
  );
  //private combinedRelations = _.union(this.relations, this.eagerRelations);

  constructor(
    @InjectRepository(DeviceModelMetricsAttributeFormula)
    private readonly repo: Repository<DeviceModelMetricsAttributeFormula>,
  ) { }

  async create(inputRecord: CreateDeviceModelMetricsAttributeFormulaDto) {
    const event = `create() : Input : ${JSON.stringify(inputRecord)}`;
    this.logger.debug(`${this.serviceName} : ${event} : Start`);
    const found = await this.repo.findOne({
      where: {
        deviceModelId: inputRecord.deviceModelId,
        metricsAttributeFormulaId: inputRecord.metricsAttributeFormulaId,
      },
    });

    if (found) {
      this.logger.info(
        `${this.serviceName} : ${event} : ${JSON.stringify(
          inputRecord,
        )} already exists`,
      );
      throw new Error(
        `${DUPLICATE_RECORD} : ${JSON.stringify(inputRecord)} already exists`,
      );
    } else {
      const res = this.repo.create(inputRecord);
      const result = await this.repo.save(res);
      this.logger.debug(
        `${this.serviceName} : ${event} : ${JSON.stringify(result)} created`,
      );
      return result;
    }
    //return result;
  }

  createBulk(
    createDeviceModelMetricsAttributeFormulas: CreateDeviceModelMetricsAttributeFormulaDto[],
  ) {
    /* const createDeviceModelMetricsAttributeFormulaObjs: CreateDeviceModelMetricsAttributeFormulaDto[] = [];
    for (const createDeviceModelMetricsAttributeFormula of createDeviceModelMetricsAttributeFormulas) {
      const createDeviceModelMetricsAttributeFormulaObj = this.repo.create(
        createDeviceModelMetricsAttributeFormula,
      );
      createDeviceModelMetricsAttributeFormulaObjs.push(
        createDeviceModelMetricsAttributeFormulaObj,
      );
    } */
    return this.repo.save(createDeviceModelMetricsAttributeFormulas);
  }

  // async findAll(
  //   searchCriteria: FindDeviceModelMetricsAttributeFormulaDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const msgTemplate = 'Find ' + this.serviceName + 's';
  //   let relations = relationsRequired ? this.relations : [];
  //   return await findAll<DeviceModelMetricsAttributeFormula>(
  //     this.repo,
  //     msgTemplate,
  //     relations,
  //     searchCriteria,
  //   );
  // }

  findByMultipleIDs(
    searchCriteria: FindDeviceModelMetricsAttributeFormulaByMultipleIDs,
    relationsRequired: boolean = false,
  ) {
    console.log('in remote service searchCriteria : ', searchCriteria);
    //const msgTemplate = 'Find ' + this.serviceName + 's';
    const relations = relationsRequired ? this.relations : [];

    return this.repo.find({
      where: {
        deviceModelId: In(searchCriteria.csvDeviceModelIDs.split(',')),
      },
      relations: relations,
    });
  }
  /* findOne(id: string) {
    return this.repo.findOne({ where : {id: id }});
  } */

  update(
    id: number,
    updateDeviceModelMetricsAttributeFormulaDto: UpdateDeviceModelMetricsAttributeFormulaDto,
  ) {
    return `This action updates a #${id} deviceModelDeviceModelAttributesFormula`;
  }

  remove(id: number) {
    return `This action removes a #${id} deviceModelDeviceModelAttributesFormula`;
  }
}
