import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlertMasterIdentifierDto } from './dto/create-alert-master-identifier.dto';
import { FindAlertMasterIdentifierDto } from './dto/find-alert-master-identifier.dto';
import { UpdateAlertMasterIdentifierDto } from './dto/update-alert-master-identifier.dto';
import { AlertMasterIdentifier } from './entities/alert-master-identifier.entity';

// import serviceConfig from '../../app_config/service.config.json';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import {
  DUPLICATE_RECORD,
  KEY_SEPARATOR,
  NO_RECORD,
} from 'src/app_config/constants';

@Injectable()
export class AlertMasterIdentifierService {
  private readonly logger = winstonServerLogger(
    AlertMasterIdentifierService.name,
  );
  // private readonly relations = serviceConfig.alertMasterIdentifier.relations;
  private readonly relations = [];

  constructor(
    @InjectRepository(AlertMasterIdentifier)
    private repo: Repository<AlertMasterIdentifier>,
  ) { }

  async create(createAlertMasterIdentifierDTO: CreateAlertMasterIdentifierDto) {
    const fnName = this.create.name;
    const input = `Input : Create AlertMasterIdentifierDto : ${JSON.stringify(
      createAlertMasterIdentifierDTO,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.findOneBy({
      id: createAlertMasterIdentifierDTO.id,
    });

    if (result != null) {
      this.logger.error(
        `${fnName}: ${DUPLICATE_RECORD} : AlertMasterIdentifier already exists`,
      );
      throw new Error(
        `${DUPLICATE_RECORD} : AlertMasterIdentifier already exists`,
      );
    } else {
      const res = this.repo.create(createAlertMasterIdentifierDTO);
      return await this.repo.save(res);
    }
  }

  async createBulk(
    createAlertMasterIdentifierDTOs: CreateAlertMasterIdentifierDto[],
  ) {
    const fnName = this.createBulk.name;
    const input = `Input : Create createAlertMasterIdentifierDto : ${JSON.stringify(
      createAlertMasterIdentifierDTOs,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const toBeCreatedRecords = [];

    for (const record of createAlertMasterIdentifierDTOs) {
      const existingRecord = await this.repo.findOneBy({ id: record.id });
      if (existingRecord) {
        this.logger.error(
          `${fnName} : ${DUPLICATE_RECORD} : ${existingRecord.id} already exists`,
        );
      } else {
        toBeCreatedRecords.push(this.repo.create(record));
      }
    }

    if (toBeCreatedRecords.length > 0) {
      const createdRecords = await this.repo.save(toBeCreatedRecords);

      this.logger.debug(
        `${fnName} : Successfully created ${createdRecords.length} records`,
      );
      return createdRecords;
    } else {
      this.logger.debug(`${fnName} : ${NO_RECORD}s to be added`);
      return [];
    }
  }

  findAll(
    searchCriteria: FindAlertMasterIdentifierDto,
    relationsRequired = false,
  ) {
    const fnName = this.findAll.name;
    const input = `Input : Find AlertMasterIdentifier with searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    let relations = relationsRequired ? this.relations : [];

    return this.repo.find({ where: searchCriteria, relations: relations });
  }

  findOne(
    searchCriteria: FindAlertMasterIdentifierDto,
    relationsRequired = false,
  ) {
    const fnName = this.findOne.name;
    const input = `Input : Find AlertMasterIdentifier with searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    let relations = relationsRequired ? this.relations : [];
    return this.repo.findOne({ where: searchCriteria, relations: relations });
  }

  findOneById(id: string, relationsRequired: boolean = false) {
    const fnName = this.findOneById.name;
    const input = `Input : Find AlertMasterIdentifier by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    let relations = relationsRequired ? this.relations : [];
    return this.repo.findOne({ where: { id: id }, relations: relations });
  }

  async update(
    id: string,
    updateAlertMasterIdentifierDto: UpdateAlertMasterIdentifierDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id: ${id} and update object : ${JSON.stringify(
      updateAlertMasterIdentifierDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateAlertMasterIdentifierDto.id == null) {
      this.logger.debug(
        `${fnName} : AlertMasterIdentifier Id not found in updateAlertMasterIdentifier`,
      );
      updateAlertMasterIdentifierDto.id = id;
    } else if (updateAlertMasterIdentifierDto.id != id) {
      this.logger.error(
        `${fnName} : AlertMasterIdentifier Id : ${id} and updateAlertMasterIdentifier object Id : ${updateAlertMasterIdentifierDto.id} do not match`,
      );
      throw new Error(
        `AlertMasterIdentifier Id : ${id} and updateAlertMasterIdentifier object Id : ${updateAlertMasterIdentifierDto.id} do not match`,
      );
    }

    const mergedAlertMasterIdentifier = await this.repo.preload(
      updateAlertMasterIdentifierDto,
    );

    if (mergedAlertMasterIdentifier == null) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : AlertMasterIdentifier Id : ${id} not found`,
      );
      throw new Error(
        `${NO_RECORD} : AlertMasterIdentifier Id : ${id} not found`,
      );
    } else {
      this.logger.debug(
        `${fnName} : Merged AlertMasterIdentifier is : ${JSON.stringify(
          mergedAlertMasterIdentifier,
        )}`,
      );

      return await this.repo.save(mergedAlertMasterIdentifier);
    }
  }

  async delete(id: string) {
    const fnName = this.delete.name;
    const input = `Input : AlertMasterIdentifier id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new Error(
        `${fnName} : ${NO_RECORD} : AlertMasterIdentifier id : ${id} not found`,
      );
    } else {
      this.logger.debug(
        `${fnName} : AlertMasterIdentifier id : ${id} deleted successfully`,
      );
      return result;
    }
  }

  async softDelete(
    id: string,
    alertMasterIdentifierToBeSoftDeleted: AlertMasterIdentifier,
  ) {
    const fnName = this.softDelete.name;
    this.logger.debug(fnName);
    await this.repo.save(alertMasterIdentifierToBeSoftDeleted);
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : AlertMasterIdentifier id : ${id} not found`,
      );
      throw new Error(
        `${NO_RECORD} : AlertMasterIdentifier id : ${id} not found`,
      );
    } else {
      this.logger.debug(
        `${fnName} : AlertMasterIdentifier id : ${id} softDeleted successfully`,
      );
      return result;
    }
  }

  async restore(id: string) {
    const fnName = this.restore.name;
    this.logger.debug(fnName);
    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : AlertMasterIdentifier id : ${id} not found`,
      );
      throw new Error(
        `${NO_RECORD} : AlertMasterIdentifier id : ${id} not found`,
      );
    } else {
      this.logger.debug(
        `${fnName} AlertMasterIdentifier id : ${id} restored successfully`,
      );
      let restored = await this.findOneById(id);
      restored!.deletedBy = undefined;
      this.repo.save(restored!);
      return restored;
    }
  }
}
