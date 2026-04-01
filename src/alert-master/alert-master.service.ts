import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlertMasterDto } from './dto/create-alert-master.dto';
import { UpdateAlertMasterDto } from './dto/update-alert-master.dto';
import { AlertMaster } from './entities/alert-master.entity';
// import serviceConfig from '../../app_config/service.config.json';
import { FindAlertMasterDto } from './dto/find-alert-master.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import {
  DUPLICATE_RECORD,
  KEY_SEPARATOR,
  NO_RECORD,
} from 'src/app_config/constants';

@Injectable()
export class AlertMasterService {
  private readonly logger = winstonServerLogger(AlertMasterService.name);
  // private readonly relations = serviceConfig.alertMaster.relations;

  constructor(
    @InjectRepository(AlertMaster)
    private readonly repo: Repository<AlertMaster>,
  ) { }

  async create(createAlertMasterDto: CreateAlertMasterDto) {
    const fnName = this.create.name;
    const input = `Input : Create AlertMasterDto : ${JSON.stringify(
      createAlertMasterDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const alertMasterIdentifierId =
      createAlertMasterDto.alertMasterIdentifierId ??
      createAlertMasterDto?.alertMasterIdentifier?.id;

    const result = await this.repo.findOneBy({
      alertMasterIdentifierId: alertMasterIdentifierId,
      alertId: createAlertMasterDto.alertId,
    });

    this.logger.debug('Found alert master : ', JSON.stringify(result));

    if (result != null) {
      this.logger.error(
        `${fnName}: ${DUPLICATE_RECORD} : AlertMaster already exists`,
      );
      throw new Error(`${DUPLICATE_RECORD} : AlertMaster already exists`);
    } else {
      const res = this.repo.create(createAlertMasterDto);
      return await this.repo.save(res);
    }
  }

  // async createBulk(createAlertMasterDTOs: CreateAlertMasterDto[]) {
  //   const fnName = this.createBulk.name;
  //   const input = `Input : Create createAlertMasterDtos : ${JSON.stringify(
  //     createAlertMasterDTOs,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   const toBeCreatedRecords = [];

  //   for (const record of createAlertMasterDTOs) {
  //     const alertMasterIdentifierId =
  //       record.alertMasterIdentifierId ?? record?.alertMasterIdentifier?.id;
  //     const alertId = record.alertId;

  //     const existingRecord = await this.repo.findOneBy({
  //       alertMasterIdentifierId: alertMasterIdentifierId,
  //       alertId: alertId,
  //     });

  //     if (existingRecord) {
  //       this.logger.error(
  //         `${fnName} : ${DUPLICATE_RECORD} : ${existingRecord.id} already exists`,
  //       );
  //     } else {
  //       toBeCreatedRecords.push(this.repo.create(record));
  //     }
  //   }

  //   if (toBeCreatedRecords.length > 0) {
  //     const createdRecords = await this.repo.save(toBeCreatedRecords);

  //     this.logger.debug(
  //       `${fnName} : Successfully created ${createdRecords.length} records`,
  //     );
  //     return createdRecords;
  //   } else {
  //     this.logger.debug(`${fnName} : ${NO_RECORD}s to be added`);
  //     return [];
  //   }
  // }

  // async findAll(searchCriteria: FindAlertMasterDto, relationsRequired = false) {
  //   const fnName = this.findAll.name;
  //   const input = `Input : Find AlertMaster with searchCriteria : ${JSON.stringify(
  //     searchCriteria,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   let relations = relationsRequired ? this.relations : [];
  //   return this.repo.find({ relations: relations, where: searchCriteria });
  // }

  // async findOne(searchCriteria: FindAlertMasterDto, relationsRequired = false) {
  //   const fnName = this.findOne.name;
  //   const input = `Input : Find AlertMaster with searchCriteria : ${JSON.stringify(
  //     searchCriteria,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   let relations = relationsRequired ? this.relations : [];
  //   return this.repo.findOne({ where: searchCriteria, relations: relations });
  // }

  // findOneById(id: string, relationsRequired: boolean = false) {
  //   const fnName = this.findOneById.name;
  //   const input = `Input : Find AlertMaster by id : ${id}`;

  //   const relations = relationsRequired ? this.relations : [];
  //   return this.repo.findOne({ where: { id: id }, relations: relations });
  // }

  // async update(id: string, updateAlertMasterDto: UpdateAlertMasterDto) {
  //   const fnName = this.update.name;
  //   const input = `Input : Id: ${id} and update object : ${JSON.stringify(
  //     updateAlertMasterDto,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (updateAlertMasterDto.id == null) {
  //     this.logger.debug(
  //       `${fnName} : AlertMaster Id not found in updateAlertMasterDto`,
  //     );
  //     updateAlertMasterDto.id = id;
  //   } else if (updateAlertMasterDto.id != id) {
  //     this.logger.error(
  //       `${fnName} : AlertMaster Id : ${id} and Update AlertMaster object Id : ${updateAlertMasterDto.id} do not match`,
  //     );
  //     throw new Error(
  //       `AlertMaster Id : ${id} and Update AlertMaster object Id :  ${updateAlertMasterDto.id} do not match`,
  //     );
  //   }

  //   const mergedAlertMaster = await this.repo.preload(updateAlertMasterDto);

  //   if (mergedAlertMaster == null) {
  //     this.logger.error(
  //       `${fnName} : ${NO_RECORD} : AlertMaster Id : ${id} not found`,
  //     );
  //     throw new Error(`${NO_RECORD} : AlertMaster Id : ${id} not found`);
  //   } else {
  //     this.logger.debug(
  //       `${fnName} : Merged AlertMaster is : ${JSON.stringify(
  //         mergedAlertMaster,
  //       )}`,
  //     );

  //     return await this.repo.save(mergedAlertMaster);
  //   }
  // }

  // async delete(id: string) {
  //   const fnName = this.delete.name;
  //   const input = `Input : AlertMaster id : ${id} to be deleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   const result = await this.repo.delete(id);
  //   if (result.affected === 0) {
  //     throw new Error(
  //       `${fnName} : ${NO_RECORD} : AlertMaster id : ${id} not found`,
  //     );
  //   } else {
  //     this.logger.debug(
  //       `${fnName} : AlertMaster id : ${id} deleted successfully`,
  //     );
  //     return result;
  //   }
  // }

  // async softDelete(id: string, alertMasterToBeSoftDeleted: AlertMaster) {
  //   const fnName = this.softDelete.name;
  //   this.logger.debug(fnName);
  //   await this.repo.save(alertMasterToBeSoftDeleted);
  //   const result = await this.repo.softDelete(id);

  //   if (result.affected === 0) {
  //     this.logger.error(
  //       `${fnName} : ${NO_RECORD} : AlertMaster id : ${id} not found`,
  //     );
  //     throw new Error(`${NO_RECORD} : AlertMaster id : ${id} not found`);
  //   } else {
  //     this.logger.debug(
  //       `${fnName} : AlertMaster id : ${id} softDeleted successfully`,
  //     );
  //     return result;
  //   }
  // }

  // async restore(id: string) {
  //   const fnName = this.restore.name;
  //   this.logger.debug(fnName);
  //   const result = await this.repo.restore(id);
  //   if (result.affected === 0) {
  //     this.logger.error(
  //       `${fnName} : ${NO_RECORD} : AlertMaster id : ${id} not found`,
  //     );
  //     throw new Error(`${NO_RECORD} : AlertMaster id : ${id} not found`);
  //   } else {
  //     this.logger.debug(
  //       `${fnName} AlertMaster id : ${id} restored successfully`,
  //     );
  //     let restored = await this.findOneById(id);
  //     restored!.deletedBy = undefined;
  //     this.repo.save(restored!);
  //     return restored;
  //   }
  // }
}
