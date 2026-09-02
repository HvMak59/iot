import { Injectable } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { FindAlertDto } from './dto/find-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { FindAlertsByMultipleIDsDTO } from './dto/find-alert-byMultipleIDs.dto';

// import serviceConfig from '/app_config/service.config.json';
import serviceConfig from '../app_config/service.config.json';
import { InjectRepository } from '@nestjs/typeorm';
import { Alert } from './entities/alert.entity';
import {
  Between,
  In,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
// import { deleteRec, restore, softDelete } from 'src/utils/cmnFn.repository';
import _, { isNull } from 'lodash';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { FindAssetDto } from 'src/asset/dto/find-asset.dto';
// import { KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { FindAlertForAPeriod } from './dto/find-alert-for-a-time-period.dto';
import { close } from 'fs';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { FindAssetDto } from 'src/asset/dto/find-asset.dto';
import { AlertGateway } from '../websocket/alert.gateway';
import { AlertStatus } from 'src/utils/enums';
// import { FindAssetDto } from 'asset/dto/find-asset.dto';

@Injectable()
export class AlertService {
  //private serviceName = serviceConfig.alert.serviceName;
  // private relations = serviceConfig.alert.relations;
  private readonly logger = winstonServerLogger(AlertService.name);
  constructor(
    @InjectRepository(Alert) private readonly repo: Repository<Alert>,
    private readonly alertGateway: AlertGateway
  ) { }

  async createBulk(createAlertsDto: CreateAlertDto[]) {
    const fnName = this.createBulk.name;
    const input = `Input : No of records : ${createAlertsDto.length}`;
    //try {  
    this.logger.debug(`${fnName} : ${input} : Start`);
    const virtualDeviceIDSet = new Set<string>();
    const alertIDSet = new Set<string>();
    const sourceAttributeSet = new Set<string>();
    for (const createAlert of createAlertsDto) {
      if (createAlert.virtualDeviceId)
        virtualDeviceIDSet.add(createAlert.virtualDeviceId);
      if (createAlert.alertId) alertIDSet.add(createAlert.alertId);
      if (createAlert.sourceAttribute)
        sourceAttributeSet.add(createAlert.sourceAttribute);
    }

    const virtualDeviceIDs = !_.isEmpty(virtualDeviceIDSet)
      ? Array.from(virtualDeviceIDSet)
      : [];
    const alertIDs = !_.isEmpty(alertIDSet) ? Array.from(alertIDSet) : [];
    const sourceAttributes = !_.isEmpty(sourceAttributeSet)
      ? Array.from(sourceAttributeSet)
      : [];
    this.logger.debug(
      `${fnName} : Virtual Device IDs : ${JSON.stringify([
        ...virtualDeviceIDs,
      ])}`,
    );
    this.logger.debug(
      `${fnName} : Alert IDs : ${JSON.stringify([...alertIDs])}`,
    );
    this.logger.debug(
      `${fnName} : Source Attributes : ${JSON.stringify([
        ...sourceAttributes,
      ])}`,
    );

    const searchObj: FindAlertsByMultipleIDsDTO = {
      csvVirtualDeviceIDs: virtualDeviceIDs.toString(),
      csvAlertIDs: alertIDs.toString(),
      csvSourceAttributes: sourceAttributes.toString(),
    };

    const retrievedAlerts = await this.findOpenAlertsByMultipleIDs(searchObj);
    this.logger.debug(
      `Retrieved alert object : ${JSON.stringify(retrievedAlerts[0])}`,
    );
    let retrievedAlertsMap;
    let alertsToBeUpdated = new Array<CreateAlertDto>();
    let alertsToBeInserted = new Array<CreateAlertDto>();
    if (!_.isEmpty(retrievedAlerts)) {
      retrievedAlertsMap = new Map<string, Alert>(
        retrievedAlerts.map((retrievedAlert) => {
          const retrievedAlertObj = new Alert(retrievedAlert);
          this.logger.debug(
            `Retrieved alert key : ${retrievedAlertObj.getKey()}`,
          );
          return [retrievedAlertObj.getKey(), retrievedAlert];
        }),
      );
      for (const reportedAlert of createAlertsDto) {
        const reportedAlertObj = this.repo.create(reportedAlert);
        this.logger.debug(`Reported alert key : ${reportedAlertObj.getKey()}`);
        const existingAlert = retrievedAlertsMap?.get(
          reportedAlertObj.getKey(),
        );
        this.logger.debug(`Existing alert : ${JSON.stringify(existingAlert)}`);
        if (existingAlert) {
          existingAlert.alertCount++;
          alertsToBeUpdated.push(existingAlert);
        } else alertsToBeInserted.push(reportedAlertObj);
      }
    } else {
      this.logger.debug(
        `${fnName} : ${input} : Retrieved alerts : ${retrievedAlerts.length}`,
      );
    }

    this.logger.debug(
      `Alerts to be inserted : ${JSON.stringify([...alertsToBeInserted])}`,
    );
    this.logger.debug(
      `Alerts to be updated : ${JSON.stringify([...alertsToBeUpdated])}`,
    );

    /* const insertResult = await this.repo.insert(alertsToBeInserted);
    const updateResult = await this.repo.upsert(alertsToBeUpdated, [
      'virtualDeviceId',
      'alertId',
      'openDateTime',
    ]); 

    this.logger.debug(
      `${fnName} : ${input} : Insert result : ${JSON.stringify(insertResult)}`,
    );
    this.logger.debug(
      `${fnName} : ${input} : Update result : ${JSON.stringify(updateResult)}`,
    );*/
    const resultantAlerts = alertsToBeInserted.concat(alertsToBeUpdated);

    return await this.repo.save(resultantAlerts);
  }

  async createBulk2(createAlertsDto: CreateAlertDto[]) {
    const fnName = this.createBulk2.name;
    const input = `Input : No of alerts : ${createAlertsDto.length}`;
    this.logger.info(fnName + KEY_SEPARATOR + input);
    const processedAlerts: CreateAlertDto[] = [];
    for (const createAlertDto of createAlertsDto) {
      this.logger.debug(
        fnName + KEY_SEPARATOR + `Processing ${JSON.stringify(createAlertDto)}`,
      );

      const existingAlert: FindAlertDto = {
        assetId: createAlertDto.assetId,
        virtualDeviceId: createAlertDto.virtualDeviceId,
        //metricsAttributeId: createAlertDto.metricsAttributeId,
        alertId: createAlertDto.alertId,
        closeDateTime: IsNull(),
      };

      existingAlert.sourceAttribute =
        createAlertDto.sourceAttribute ?? IsNull();

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
        const findCriteriaToCloseAlert: FindAlertDto = {
          assetId: createAlertDto.assetId,
          virtualDeviceId: createAlertDto.virtualDeviceId,
          //metricsAttributeId: createAlertDto.metricsAttributeId,
          alertId: Not(createAlertDto.alertId!),
          closeDateTime: IsNull(),
        };
        findCriteriaToCloseAlert.sourceAttribute =
          createAlertDto.sourceAttribute ?? IsNull();
        const updateAlert: UpdateAlertDto = {
          closeDateTime: createAlertDto.openDateTime ?? new Date(),
        };

        const closeAlerts = await this.closeAlerts(
          findCriteriaToCloseAlert,
          updateAlert,
        );

        this.logger.debug(
          `${JSON.stringify(findCriteriaToCloseAlert)} No of alerts closed : ${closeAlerts.affected
          }`,
        );

        const createAlertObj = this.repo.create(createAlertDto);

        this.logger.debug(`${JSON.stringify(createAlertObj)} creating alert`);

        const createAlert = await this.repo.save(createAlertObj);

        this.logger.debug(`${JSON.stringify(createAlert)} created`);
      }

      /* const foundAlert = await this.repo.increment(
        existingAlert,
        'alertCount',
        1,
      ); */
      processedAlerts.push(createAlertDto);
    }
    return processedAlerts;
  }

  createBulk3(createAlertDTOs: CreateAlertDto[]) {
    const fnName = this.createBulk3.name;
    const input = `Input : ${JSON.stringify([...createAlertDTOs])}`;
    this.logger.debug(`${fnName} : ${input}`);
    const createCOAlertDTOObjs: CreateAlertDto[] = [];

    for (const createAlertDTO of createAlertDTOs) {
      const createCOAlertDTOObj: CreateAlertDto =
        this.repo.create(createAlertDTO);
      createCOAlertDTOObjs.push(createCOAlertDTOObj);
    }
    return this.repo.save(createCOAlertDTOObjs);
  }
  async create(createAlertDto: CreateAlertDto) {
    const fnName = this.create.name;
    const input = `Input : Create Alert : ${JSON.stringify(createAlertDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const virtualDeviceId =
      createAlertDto.virtualDeviceId ?? createAlertDto.virtualDevice?.id;
    const alertId = createAlertDto.alertId;

    const searchCriteria: FindAlertDto = {
      virtualDeviceId: virtualDeviceId,
      alertId: alertId,
    };
    searchCriteria.sourceAttribute = createAlertDto.sourceAttribute ?? IsNull();
    const retrievedAlert = await this.findOpenAlert(searchCriteria);
    let alert: Alert;
    if (retrievedAlert) {
      this.logger.debug(
        `${fnName} : Alerts to be Updated : ${JSON.stringify(retrievedAlert)}`,
      );
      retrievedAlert.alertCount++;
      alert = retrievedAlert;
      //return await this.repo.save(retrievedAlert);
    } else {
      const alertToBeInserted = this.repo.create(createAlertDto);
      alert = alertToBeInserted;
      this.logger.debug(
        `${fnName} : Alerts to be added : ${JSON.stringify(alertToBeInserted)}`,
      );
    }
    return await this.repo.save(alert);
  }

  save(alerts: Alert[]) {
    const fnName = this.save.name;
    const input = `Input : ${JSON.stringify([...alerts])}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.save(alerts);
  }

  async sendToWebsocket(assetId: string) {
    console.log("in send service");
    const alertToBeSent = {
      assetId: assetId
    }
    this.alertGateway.sendAlerts(
      assetId,
      AlertStatus.created,
      [alertToBeSent as Alert]
    )
  }


  findAll(
    searchCriteria: FindAlertDto | FindAlertDto[],
    relationsRequired = false,
  ) {
    return this.repo.find({
      where: searchCriteria,
      // relations: relationsRequired ? this.relations : [],
      order: {
        openDateTime: 'DESC',
      },
    });
    //return findAll<Alert>(this.repo, fnName, relations, searchCriteria);
  }



  findOne(searchCriteria: FindAlertDto, relationsRequired = false) {
    return this.repo.findOne({
      where: searchCriteria,
      // relations: relationsRequired ? this.relations : [],
    });
  }

  findOneById(id: string) {
    const fnName = this.findOneById.name;
    this.logger.debug(fnName);
    return this.repo.findOneBy({ id: id });
  }

  findByMultipleIDs(searchObj: FindAlertsByMultipleIDsDTO) {
    const searchObject: FindAlertDto =
      this.getFindAlertDTOFromMultipleIDs(searchObj);
    return this.findAll(searchObject);
  }

  findByMultipleIDsWithRelations(searchObj: FindAlertsByMultipleIDsDTO) {
    const searchObject: FindAlertDto =
      this.getFindAlertDTOFromMultipleIDs(searchObj);
    const relationsRequired = true;
    return this.findAll(searchObject, relationsRequired);
  }

  findOpenAlertsByMultipleIDs(searchCriteria: FindAlertsByMultipleIDsDTO) {
    const searchObj: FindAlertDto =
      this.getFindAlertDTOFromMultipleIDs(searchCriteria);
    searchObj.closeDateTime = IsNull();
    return this.findAll(searchObj);
  }

  findOpenAlert(searchCriteria: FindAlertDto, relationsRequired = false) {
    // const relations = relationsRequired ? this.relations : [];
    const whereCriteria = searchCriteria as Partial<Alert>;

    return this.repo.findOne({
      where: {
        //assetId: whereCriteria.assetId,
        virtualDeviceId: whereCriteria.virtualDeviceId,
        alertId: whereCriteria.alertId,
        closeDateTime: IsNull(),
      },
      // relations: relations,
      order: {
        openDateTime: 'DESC',
      },
    });
  }

  async findAllOpenAlerts(skip = 0, take = 500) {
    const fnName = this.findAll.name;
    const input = `Input: Find all open alerts`;

    // const relations = relationsRequired ? relation : [];
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.repo.find({
      // where: {
      // closeDateTime: IsNull()
      // },
      skip,
      take,
    });
  }

  findForATimePeriod(searchCriteria: FindAlertForAPeriod) {
    const fnName = this.findForATimePeriod.name;
    const input = `Input : SearchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const startTime =
      typeof searchCriteria.startTime == 'string'
        ? Number(searchCriteria.startTime).valueOf()
        : searchCriteria.startTime;
    const endTime =
      typeof searchCriteria.endTime == 'string'
        ? Number(searchCriteria.endTime).valueOf()
        : searchCriteria.endTime;

    const findAlertDTO: FindAlertDto = {
      assetId: searchCriteria.assetId,
      openDateTime: Between<Date>(new Date(startTime), new Date(endTime)),
    };

    if (searchCriteria.virtualDeviceId) {
      findAlertDTO.virtualDeviceId = searchCriteria.virtualDeviceId;
    }

    return this.repo.find({
      where: findAlertDTO,
      order: {
        openDateTime: 'DESC',
      },
    });
  }

  findForATimePeriod2(searchCriteria: FindAlertForAPeriod) {
    const fnName = this.findForATimePeriod.name;
    const input = `Input : SearchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const startTime =
      typeof searchCriteria.startTime === 'string'
        ? Number(searchCriteria.startTime)
        : searchCriteria.startTime;

    const endTime =
      typeof searchCriteria.endTime === 'string'
        ? Number(searchCriteria.endTime)
        : searchCriteria.endTime;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const baseCondition = {
      assetId: searchCriteria.assetId,
      ...(searchCriteria.virtualDeviceId && {
        virtualDeviceId: searchCriteria.virtualDeviceId,
      }),
      ...(searchCriteria.sourceAttribute && {
        sourceAttribute: searchCriteria.sourceAttribute,
      }),
    };

    const whereClause = [
      // Case 1: Opened within range
      {
        ...baseCondition,
        openDateTime: Between(startDate, endDate),
      },
      // Case 2: Opened before start, and still open
      {
        ...baseCondition,
        openDateTime: LessThan(startDate),
        closeDateTime: IsNull(),
      },
      // Case 3: Opened before start, and closed after start (overlaps into range)
      {
        ...baseCondition,
        openDateTime: LessThan(startDate),
        closeDateTime: MoreThan(startDate),
      },
    ];

    return this.repo.find({
      where: whereClause,
      order: {
        openDateTime: 'DESC',
      },
    });
  }

  findForATimePeriod3(searchCriteria: FindAlertsByMultipleIDsDTO) {
    const fnName = this.findForATimePeriod3.name;
    const input = `Input : SearchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const searchObj: FindAlertDto =
      this.getFindAlertDTOFromMultipleIDs(searchCriteria);

    this.logger.debug(
      `${fnName} : FindAlertDto : ${JSON.stringify(searchObj)}`,
    );

    const startTime =
      typeof searchCriteria.startTime === 'string'
        ? Number(searchCriteria.startTime)
        : searchCriteria.startTime;

    const endTime =
      typeof searchCriteria.endTime === 'string'
        ? Number(searchCriteria.endTime)
        : searchCriteria.endTime;

    const startDate = new Date(startTime!);
    const endDate = new Date(endTime!);

    const whereClause = [
      // Case 1: Opened within range
      {
        ...searchObj,
        openDateTime: Between(startDate, endDate),
      },
      // Case 2: Opened before start, and still open
      {
        ...searchObj,
        openDateTime: LessThan(startDate),
        closeDateTime: IsNull(),
      },
      // Case 3: Opened before start, and closed after start (overlaps into range)
      {
        ...searchObj,
        openDateTime: LessThan(startDate),
        closeDateTime: MoreThan(startDate),
      },
    ];

    this.logger.debug(
      `${fnName} : Where Clause : ${JSON.stringify(whereClause)}`,
    );

    return this.repo.find({
      where: whereClause,
      order: {
        openDateTime: 'DESC',
      },
    });
  }

  closeAlerts(findAlertDto: FindAlertDto, updateAlertDto: UpdateAlertDto) {
    findAlertDto.closeDateTime = IsNull();
    // updateAlertDto.closeDateTime == updateAlertDto.closeDateTime ?? new Date();  // uncomment
    //Object.assign(findAlertDto, closeDateNullCriteria);
    //const whereCriteria = findAlertDto as Partial<Alert>;
    this.logger.debug(`whereCriteria : ${JSON.stringify(findAlertDto)}`);
    return this.repo.update(findAlertDto, updateAlertDto);
    /* findAlertDto
    const whereCriteria: FindAlertDto = {
      closeDateTime: IsNull(),
    } 
    
    if (whereCriteria.virtualDeviceId) {
      return this.repo.update(
        {
          //assetId: whereCriteria.assetId,
          virtualDeviceId: whereCriteria.virtualDeviceId,
          closeDateTime: IsNull(),
        },
        updateAlertDto,
        //{ closeDateTime: new Date() },
      );
    } else {
      return this.repo.update(
        {
          //assetId: whereCriteria.assetId,
          closeDateTime: IsNull(),
        },
        updateAlertDto,
        //{ closeDateTime: new Date() },
      );
    }*/
  }

  async closeAlerts2(
    findAlertDTOs: FindAlertDto[],
    closeDateTime?: /* Date |  */ number,
  ) {
    const fnName = this.closeAlerts2.name;
    const input = `Input : closeDateTime: ${closeDateTime}, Find Alerts : ${JSON.stringify(
      [...findAlertDTOs],
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`typeof closeDateTime : ${typeof closeDateTime}`);

    let closeDateTimeInDate: Date;
    if (closeDateTime) {
      if (typeof closeDateTime == 'string') {
        closeDateTime = parseInt(closeDateTime);
        closeDateTimeInDate = new Date(closeDateTime);
      } else {
        closeDateTimeInDate = new Date();
      }
    } else {
      closeDateTimeInDate = new Date();
    }
    //const closeTime = closeDateTime ? new Date(parseInt(closeDateTime)) : new Date();
    /* const closeTime = closeDateTime
      ? (typeof closeDateTime == 'number'
        ? new Date(closeDateTime as number)
        : (closeDateTime as Date))
      : new Date(); */
    const alertsTobeClosed = await this.repo.find({ where: findAlertDTOs });

    if (alertsTobeClosed.length > 0) {
      for (const alert of alertsTobeClosed) {
        alert.closeDateTime = closeDateTimeInDate;
      }
      return await this.repo.save(alertsTobeClosed);
    } else {
      this.logger.debug(`${fnName} : No Alert to close`);
      return [];
    }
  }

  closeAlert(findAlertDto: FindAlertDto, closeDateTime?: Date | number) {
    return this.updateWithFindObject(findAlertDto, {
      closeDateTime: closeDateTime ? closeDateTime : new Date(),
    });
  }

  closeAlertsByMultipleIDs(
    findAlertsByMultipleIDsDTO: FindAlertsByMultipleIDsDTO,
    closeDateTime?: Date,
  ) {
    const fnName = this.closeAlertsByMultipleIDs.name;
    const input = `Input : ${JSON.stringify(findAlertsByMultipleIDsDTO)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const closeTime = closeDateTime ? closeDateTime : new Date();
    return this.repo.update(
      this.getFindAlertDTOFromMultipleIDs(findAlertsByMultipleIDsDTO),
      { closeDateTime: closeTime },
    );
  }

  async updateWithFindObject(
    findAlertDto: FindAlertDto,
    updateAlertDto: UpdateAlertDto,
  ) {
    const fnName = this.updateWithFindObject.name;
    const input = `Input : Find Object : ${JSON.stringify(
      findAlertDto,
    )}, Update Object : ${JSON.stringify(updateAlertDto)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.update(findAlertDto, updateAlertDto);
    if (result != null && result.affected != undefined && result.affected > 0) {
      return findAlertDto;
    } else {
      throw new Error(`${JSON.stringify(findAlertDto)} not found`);
    }
    /* const mergedAlert = await this.repo.preload(findAlertDto);
    if (mergedAlert == null) {
      throw new Error(`${NO_RECORD} : Alert : ${JSON.stringify(findAlertDto)} not found`);
    } else {
      this.logger.debug(
        `${fnName} : Merged Alert is : ${JSON.stringify(mergedAlert)}`,
      );

      const savedAlert = await this.repo.save(mergedAlert);
      this.logger.debug(
        `${fnName} : Saved Alert is : ${JSON.stringify(savedAlert)}`,
      );
      return savedAlert;
    } */
  }

  async update(id: string, updateAlertDto: UpdateAlertDto) {
    const fnName = 'update()';
    const input = `Input : Id : ${id}, Update Object : ${JSON.stringify(
      updateAlertDto,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    if (updateAlertDto.id == null) {
      this.logger.debug(`${fnName} : Alert Id not found in updateAlertDto`);
      updateAlertDto.id = id;
    } else if (updateAlertDto.id != id) {
      throw new Error('Alert Id and Update Alert Object Id do not match');
    }
    const mergedAlert = await this.repo.preload(updateAlertDto);
    if (mergedAlert == null) {
      throw new Error(`${NO_RECORD} : Alert id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} : Merged Alert is : ${JSON.stringify(mergedAlert)}`,
      );

      const savedAlert = await this.repo.save(mergedAlert);
      this.logger.debug(
        `${fnName} : Saved Alert is : ${JSON.stringify(savedAlert)}`,
      );
      return savedAlert;
    }
  }

  updateMany(updateAlertDTOs: UpdateAlertDto[]) {
    const fnName = this.updateMany.name;
    const input = `Input : ${JSON.stringify([...updateAlertDTOs])}`;
    this.logger.debug(`${fnName} : ${input}`);
    return this.repo.save(updateAlertDTOs);
  }

  async delete(id: string) {
    const fnName = this.delete.name;
    const input = `Alert Id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new Error(`${fnName} : ${NO_RECORD} : ALert id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : ALert id : ${id} deleted successfully`);
      return result;
    }
  }

  async softDelete(id: string, alertToBeDeleted: Alert) {
    const fnName = this.softDelete.name;
    const input = `Alert Id : ${id} to be softDeleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    await this.repo.save(alertToBeDeleted);
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      throw new Error(`${fnName} : ${NO_RECORD} : ALert id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} : Alert id : ${id} softDeleted successfully`,
      );
      return result;
    }
  }

  async restore(id: string) {
    const fnName = this.restore.name;
    const input = `Input : Alert id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : Alert id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : Alert id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} Alert id : ${id} restored successfully`);
      let restored = await this.findOneById(id);
      restored!.deletedBy = undefined;
      this.repo.save(restored!);
      return restored;
    }
  }

  getFindAlertDTOFromMultipleIDs(searchCriteria: FindAlertsByMultipleIDsDTO) {
    const findAssetDTO: FindAssetDto = {};
    const findAlertDTO: FindAlertDto = {};
    if (!_.isEmpty(searchCriteria.csvIDs)) {
      const csvIDs = searchCriteria.csvIDs;
      const iDs = csvIDs?.split(',');
      const uniqueIDs = _.uniq(iDs);
      findAlertDTO.id = In(uniqueIDs);
    }
    if (searchCriteria.csvOrgIDs && searchCriteria.csvOrgIDs.length > 0) {
      const orgIDs = searchCriteria.csvOrgIDs.split(',');
      const uniqueOrgIDs = _.uniq(orgIDs);
      // findAssetDTO.orgId = In(uniqueOrgIDs);
    }
    if (
      searchCriteria.csvAssetTypeIDs &&
      searchCriteria.csvAssetTypeIDs.length > 0
    ) {
      const assetTypeIDs = searchCriteria.csvAssetTypeIDs.split(',');
      const uniqueAssetTypeIDs = _.uniq(assetTypeIDs);
      // findAssetDTO.assetTypeId = In(uniqueAssetTypeIDs);
    }
    if (_.keys(findAssetDTO).length > 0) {
      findAlertDTO.asset = findAssetDTO;
    }
    if (searchCriteria.csvAssetIDs && searchCriteria.csvAssetIDs.length > 0) {
      const assetIDs = searchCriteria.csvAssetIDs.split(',');
      const uniqueAssetIDs = _.uniq(assetIDs);
      findAlertDTO.assetId = In(uniqueAssetIDs);
    }
    if (
      searchCriteria.csvVirtualDeviceIDs &&
      searchCriteria.csvVirtualDeviceIDs.length > 0
    ) {
      const virtualDeviceIDs = searchCriteria.csvVirtualDeviceIDs.split(',');
      const uniqueVirtualDeviceIDs = _.uniq(virtualDeviceIDs);
      findAlertDTO.virtualDeviceId = In(uniqueVirtualDeviceIDs);
    }
    if (searchCriteria.csvAlertIDs && searchCriteria.csvAlertIDs.length > 0) {
      const alertIDs = searchCriteria.csvAlertIDs.split(',');
      const uniqueAlertIDs = _.uniq(alertIDs);
      findAlertDTO.alertId = In(uniqueAlertIDs);
    }
    return findAlertDTO;
  }
}
