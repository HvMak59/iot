import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCurrentOpenAlertDto } from './dto/create-current-open-alert.dto';
import { UpdateCurrentOpenAlertDto } from './dto/update-current-open-alert.dto';

// import serviceConfig from '../../app_config/service.config.json';
import { CurrentOpenAlert } from './entities/current-open-alert.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, IsNull, Not, Repository } from 'typeorm';
import { FindCurrentOpenAlertDto } from './dto/find-current-open-alert.dto';
// import { findAll, restore, softDelete } from 'utils/cmnFn.repository';
// import { getTryCatchErrorStr } from 'utils/others';
import _ from 'lodash';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { FindAssetDto } from 'src/asset/dto/find-asset.dto';
import { FindAlertsByMultipleIDsDTO } from './dto/find-current-open-alert-byMultipleIDs.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { getTryCatchErrorStr } from 'src/utils/others';
// import { KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';

@Injectable()
export class CurrentOpenAlertService {
  private serviceName = CurrentOpenAlertService.name;
  // relations = serviceConfig.currentOpenAlert.relations;
  relations = [];
  private readonly logger = winstonServerLogger(CurrentOpenAlertService.name);
  constructor(
    @InjectRepository(CurrentOpenAlert)
    private readonly repo: Repository<CurrentOpenAlert>,
  ) { }
  async createBulk(createCurrentOpenAlertsDto: CreateCurrentOpenAlertDto[]) {
    const fnName = this.createBulk.name;
    const event = `Input : No of records : ${createCurrentOpenAlertsDto.length}`;
    //try {
    this.logger.debug(`${fnName} : Start`);
    this.logger.debug(`${fnName} : ${event}`);
    const virtualDeviceIDSet = new Set<string>();
    const alertIDSet = new Set<string>();
    const sourceAttributeSet = new Set<string>();

    for (let index = 0; index < createCurrentOpenAlertsDto.length; index++) {
      createCurrentOpenAlertsDto[index] = this.repo.create(
        createCurrentOpenAlertsDto[index],
      );
      if (createCurrentOpenAlertsDto[index].virtualDeviceId)
        virtualDeviceIDSet.add(
          createCurrentOpenAlertsDto[index].virtualDeviceId!,
        );
      if (createCurrentOpenAlertsDto[index].alertId)
        alertIDSet.add(createCurrentOpenAlertsDto[index].alertId!);
      if (createCurrentOpenAlertsDto[index].sourceAttribute)
        sourceAttributeSet.add(
          createCurrentOpenAlertsDto[index].sourceAttribute!,
        );
    }

    const virtualDeviceIDs = !_.isEmpty(virtualDeviceIDSet)
      ? Array.from(virtualDeviceIDSet)
      : [];
    const alertIDs = !_.isEmpty(alertIDSet) ? Array.from(alertIDSet) : [];
    const sourceAttributes = !_.isEmpty(sourceAttributeSet)
      ? Array.from(sourceAttributeSet)
      : [];

    this.logger.debug(
      `${fnName} : ${event} : Virtual Device IDs : ${JSON.stringify([
        ...virtualDeviceIDs,
      ])}`,
    );
    this.logger.debug(
      `${fnName} : ${event} : Alert IDs : ${JSON.stringify([...alertIDs])}`,
    );
    this.logger.debug(
      `${fnName} : ${event} : Source attributes : ${JSON.stringify([
        ...sourceAttributes,
      ])}`,
    );

    const searchCriteria: FindAlertsByMultipleIDsDTO = {
      csvVirtualDeviceIDs: virtualDeviceIDs.toString(),
      csvSourceAttributeIDs: sourceAttributeSet.toString(),
      csvAlertIDs: alertIDs.toString(),
    };

    const retrievedAlerts = await this.findByMultipleIDs(searchCriteria);
    this.logger.debug(
      `${fnName} : Retrieved alerts : ${retrievedAlerts.length}`,
    );
    let retrievedAlertsMap;
    let alertsToBeUpdated = new Array<CreateCurrentOpenAlertDto>();
    let alertsToBeInserted = new Array<CreateCurrentOpenAlertDto>();
    if (!_.isEmpty(retrievedAlerts)) {
      retrievedAlertsMap = new Map<string, CurrentOpenAlert>(
        retrievedAlerts.map((retrievedAlert) => {
          const retrievedAlertObj = new CurrentOpenAlert(retrievedAlert);
          return [retrievedAlertObj.getKey(), retrievedAlert];
        }),
      );
      for (const reportedAlert of createCurrentOpenAlertsDto) {
        const reportedAlertObj = this.repo.create(reportedAlert);
        const existingAlert = retrievedAlertsMap?.get(
          reportedAlertObj.getKey(),
        );
        if (existingAlert) {
          this.logger.debug(
            `Found existing alert : ${JSON.stringify(existingAlert)}`,
          );
          existingAlert.alertCount++;
          alertsToBeUpdated.push(existingAlert);
        } else {
          this.logger.debug(
            `Not Found existing alert : ${JSON.stringify(reportedAlertObj)}`,
          );
          alertsToBeInserted.push(reportedAlertObj);
        }
      }
    } else {
      this.logger.debug(`${fnName} : No Retrieved alerts`);
      alertsToBeInserted = createCurrentOpenAlertsDto;
    }

    this.logger.debug(
      `Alerts to be inserted : ${JSON.stringify([...alertsToBeInserted])}`,
    );
    this.logger.debug(
      `Alerts to be updated : ${JSON.stringify([...alertsToBeUpdated])}`,
    );

    const allOfAlerts = alertsToBeInserted.concat(alertsToBeUpdated);
    this.logger.debug('Before save');
    const saveResult = await this.repo.save(
      allOfAlerts /* , [
      'virtualDeviceId',
      'alertId',
    ] */,
    );

    this.logger.debug(
      `${fnName} : ${event} : Saved result : ${JSON.stringify(saveResult)}`,
    );

    return saveResult;
  }

  async createBulk2(createCurrentOpenAlertDTOs: CreateCurrentOpenAlertDto[]) {
    const fnName = this.createBulk2.name;
    const input = `Input : No of alerts : ${createCurrentOpenAlertDTOs.length}`;
    this.logger.info(fnName + KEY_SEPARATOR + input);
    const processedAlerts: CreateCurrentOpenAlertDto[] = [];
    for (const createCurrentOpenAlertDto of createCurrentOpenAlertDTOs) {
      this.logger.debug(
        fnName +
        KEY_SEPARATOR +
        `Processing ${JSON.stringify(createCurrentOpenAlertDto)}`,
      );

      const existingAlert: FindCurrentOpenAlertDto = {
        assetId: createCurrentOpenAlertDto.assetId,
        virtualDeviceId: createCurrentOpenAlertDto.virtualDeviceId,
        sourceAttribute: createCurrentOpenAlertDto.sourceAttribute,
        alertId: createCurrentOpenAlertDto.alertId,
      };

      this.logger.debug(
        `${JSON.stringify(existingAlert)} alertCount to be incremented`,
      );

      const foundAlert = await this.findOne(existingAlert);

      if (foundAlert) {
        foundAlert.alertCount++;
        this.logger.debug(
          `${JSON.stringify(foundAlert)} alertCount incremented`,
        );
        return await this.repo.update(foundAlert.id, {
          alertCount: foundAlert.alertCount,
        });
      } else {
        const findCriteriaToCloseAlert: FindCurrentOpenAlertDto = {
          assetId: createCurrentOpenAlertDto.assetId,
          virtualDeviceId: createCurrentOpenAlertDto.virtualDeviceId,
          sourceAttribute: createCurrentOpenAlertDto.sourceAttribute,
          alertId: Not(createCurrentOpenAlertDto.alertId!),
        };

        const deleteAlerts = await this.delete(findCriteriaToCloseAlert);

        this.logger.debug(
          `${JSON.stringify(findCriteriaToCloseAlert)} No of alerts deleted : ${deleteAlerts.affected
          }`,
        );

        const createCurrentOpenAlertDTOObj = this.repo.create(
          createCurrentOpenAlertDto,
        );

        const createAlert = await this.repo.save(createCurrentOpenAlertDTOObj);

        this.logger.debug(`${JSON.stringify(createAlert)} created`);
      }
      processedAlerts.push(createCurrentOpenAlertDto);
    }
    return processedAlerts;
  }

  createBulk3(createCurrentOpenAlertDTOs: CreateCurrentOpenAlertDto[]) {
    const fnName = this.createBulk3.name;
    const input = `Input : ${JSON.stringify([...createCurrentOpenAlertDTOs])}`;
    this.logger.debug(`${fnName} : ${input}`);
    const createCOAlertDTOObjs: CreateCurrentOpenAlertDto[] = [];
    for (const createCurrentOpenAlertDTO of createCurrentOpenAlertDTOs) {
      const createCurrentOpenAlertDTOObj = this.repo.create(
        createCurrentOpenAlertDTO,
      );
      createCOAlertDTOObjs.push(createCurrentOpenAlertDTOObj);
    }
    return this.repo.save(createCOAlertDTOObjs);
  }
  async create(createCurrentOpenAlertDto: CreateCurrentOpenAlertDto) {
    const fnName = this.create.name;
    const input = `Input : Create CurrentOpenAlert : ${JSON.stringify(
      createCurrentOpenAlertDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const virtualDeviceId =
      createCurrentOpenAlertDto.virtualDeviceId ??
      createCurrentOpenAlertDto.virtualDevice?.id;
    const alertId = createCurrentOpenAlertDto.alertId;

    const searchCriteria: FindCurrentOpenAlertDto = {
      virtualDeviceId: virtualDeviceId,
      alertId: alertId,
    };

    searchCriteria.sourceAttribute =
      createCurrentOpenAlertDto.sourceAttribute ?? IsNull();

    const retrievedCurrentOpenAlert = await this.findOne(searchCriteria);

    if (retrievedCurrentOpenAlert) {
      // this.logger.debug(`${fnName} : Existing alert : ${JSON.stringify(retrievedCurrentOpenAlert)}`);
      this.logger.debug(
        `${fnName} : CurrentOpenAlerts to be updated : ${JSON.stringify(
          retrievedCurrentOpenAlert,
        )}`,
      );
      retrievedCurrentOpenAlert.alertCount++;
      return await this.repo.save(retrievedCurrentOpenAlert);
    } else {
      this.logger.debug(
        `${fnName} : CurrentOpenAlerts to be added : ${JSON.stringify(
          createCurrentOpenAlertDto,
        )}`,
      );
      const currentOpenAlertToBeInserted = this.repo.create(
        createCurrentOpenAlertDto,
      );
      return await this.repo.save(currentOpenAlertToBeInserted);
    }
  }

  findAll(searchCriteria: FindCurrentOpenAlertDto, relationsRequired = false) {
    const msgTemplate = 'Find ' + this.serviceName + 's';
    const relations = relationsRequired ? this.relations : [];
    // return findAll<CurrentOpenAlert>(
    //   this.repo,
    //   msgTemplate,
    //   relations,
    //   searchCriteria,
    // );
    return this.repo.find({ where: searchCriteria });
  }

  async findAllBySearchTerm(searchTerm: string, relationsRequired = false) {
    const msgTemplate = 'Find By Search Term' + this.serviceName + 's';
    const wildCardSearchTerm = '%' + searchTerm.concat('%');
    try {
      this.logger.debug(
        `${msgTemplate} : Input : Search term : ${wildCardSearchTerm} : Start`,
      );
      return await this.repo.find({
        where: {
          searchTerm: ILike(wildCardSearchTerm),
        },
        order: {
          openDateTime: 'DESC',
        },
      });
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(
        `${msgTemplate} : Input : Search term : ${wildCardSearchTerm} : End`,
      );
    }
    /* const relations = relationsRequired ? this.relations : [];
    return findAll<CurrentOpenAlert>(
      this.repo,
      msgTemplate,
      relations,
      searchCriteria,
    ); */
  }

  async findOne(
    searchCriteria: FindCurrentOpenAlertDto,
    relationsRequired = false,
  ) {
    const relations = relationsRequired ? this.relations : [];
    const whereCriteria = searchCriteria as FindOptionsWhere<CurrentOpenAlert>;
    return await this.repo.findOne({
      where: whereCriteria,
      relations: relations,
    });
  }

  findByMultipleIDs(
    searchCriteria: FindAlertsByMultipleIDsDTO,
    relationsRequired = false,
  ) {
    const searchObject =
      this.getFindCurrentOpenAlertDTOFromMultipleIDs(searchCriteria);
    return this.findAll(searchObject, relationsRequired);
  }

  async update(
    id: string,
    updateCurrentOpenAlertDto: UpdateCurrentOpenAlertDto,
  ) {
    const fnName = 'update()';
    const input = `Input : Update Object : ${JSON.stringify(
      updateCurrentOpenAlertDto,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateCurrentOpenAlertDto.id == null) {
      this.logger.debug(
        `${fnName} : Current Open Alert Id not found in updateCurrentOpenAlertDto`,
      );
      updateCurrentOpenAlertDto.id = id;
    } else if (updateCurrentOpenAlertDto.id != id) {
      throw new Error(
        'Current Open Alert Id and Update Object Id do not match',
      );
    }
    const mergedCurrentOpenAlert = await this.repo.preload(
      updateCurrentOpenAlertDto,
    );
    if (mergedCurrentOpenAlert == null) {
      throw new Error(`${NO_RECORD} : Current open alert id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} : Merged current open alert is : ${JSON.stringify(
          mergedCurrentOpenAlert,
        )}`,
      );
      const savedCurrentOpenAlert = await this.repo.save(
        mergedCurrentOpenAlert,
      );
      this.logger.debug(
        `${fnName} : Saved Current open alert is : ${JSON.stringify(
          savedCurrentOpenAlert,
        )}`,
      );
      return savedCurrentOpenAlert;
    }
  }

  updateMany(updateCurrentOpenAlertDTOs: UpdateCurrentOpenAlertDto[]) {
    const fnName = this.updateMany.name;
    const input = `Input : ${JSON.stringify([...updateCurrentOpenAlertDTOs])}`;
    this.logger.debug(`${fnName} : ${input}`);
    return this.repo.save(updateCurrentOpenAlertDTOs);
  }

  save(currentOpenAlerts: CurrentOpenAlert[]) {
    const fnName = this.save.name;
    const input = `Input : ${JSON.stringify([...currentOpenAlerts])}`;
    this.logger.debug(`${fnName} : ${input}`);
    return this.repo.save(currentOpenAlerts);
  }

  /* delete(id: string) {
    const msgTemplate = 'Delete ' + this.serviceName;
    return deleteRec<CurrentOpenAlert>(this.repo, id, msgTemplate);
  } */

  async bulkDelete(ids: string[]) {
    const fnName = this.bulkDelete.name;
    const input = `Input : CurrentOpenAlerts to be deleted : ${[...ids]}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // Fetch records to be deleted
    const recordsToBeDeleted = await this.repo.findBy({ id: In(ids) });

    const deleteResult = await this.repo.delete({ id: In(ids) });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return recordsToBeDeleted;
    } else {
      this.logger.debug(`${fnName}: No records deleted.`);
      return [];
    }
  }
  delete(findCurrentOpenAlert: FindCurrentOpenAlertDto) {
    const msgTemplate = 'Delete ' + this.serviceName;
    this.logger.debug(
      `${msgTemplate} : Input : ${JSON.stringify(findCurrentOpenAlert)}`,
    );
    return this.repo.delete(findCurrentOpenAlert);
  }

  async softDelete(id: string, currentOpenAlertToBeDeleted: CurrentOpenAlert) {
    const fnName = this.softDelete.name;
    const input = `Input : Current Open Alert Id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    await this.repo.save(currentOpenAlertToBeDeleted);
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : CurrentOpenAlert id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : CurrentOpenAlert id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} : CurrentOpenAlert id : ${id} softDeleted successfully`,
      );
      return result;
    }
  }

  async restore(id: string) {
    const fnName = this.restore.name;
    const input = `Input : Current Open Alert id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : CurrentOpenAlert id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : CurrentOpenAlert id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} CurrentOpenAlert id : ${id} restored successfully`,
      );
      let restored = await this.findOne({ id: id });
      restored!.deletedBy = undefined;
      this.repo.save(restored!);
      return restored;
    }
  }

  getFindCurrentOpenAlertDTOFromMultipleIDs(
    searchCriteria: FindAlertsByMultipleIDsDTO,
  ) {
    const findAssetDTO: FindAssetDto = {};
    const findCurrentOpenAlertDTO: FindCurrentOpenAlertDto = {};
    if (searchCriteria.csvOrgIDs && searchCriteria.csvOrgIDs.length > 0) {
      findAssetDTO.orgId = In(searchCriteria.csvOrgIDs.split(','));
    }
    if (
      searchCriteria.csvAssetTypeIDs &&
      searchCriteria.csvAssetTypeIDs.length > 0
    ) {
      findAssetDTO.assetTypeId = In(searchCriteria.csvAssetTypeIDs.split(','));
    }
    if (_.keys(findAssetDTO).length > 0) {
      findCurrentOpenAlertDTO.asset = findAssetDTO;
    }
    if (searchCriteria.csvAssetIDs && searchCriteria.csvAssetIDs.length > 0) {
      findCurrentOpenAlertDTO.assetId = In(
        searchCriteria.csvAssetIDs.split(','),
      );
    }
    if (
      searchCriteria.csvVirtualDeviceIDs &&
      searchCriteria.csvVirtualDeviceIDs.length > 0
    ) {
      findCurrentOpenAlertDTO.virtualDeviceId = In(
        searchCriteria.csvVirtualDeviceIDs.split(','),
      );
    }
    if (searchCriteria.csvAlertIDs && searchCriteria.csvAlertIDs.length > 0) {
      findCurrentOpenAlertDTO.alertId = In(
        searchCriteria.csvAlertIDs.split(','),
      );
    }
    return findCurrentOpenAlertDTO;
  }
}
