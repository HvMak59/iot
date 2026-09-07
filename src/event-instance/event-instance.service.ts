import { Injectable } from '@nestjs/common';
import { CreateEventInstanceDto } from './dto/create-event-instance.dto';
import { UpdateEventInstanceDto } from './dto/update-event-instance.dto';
import { KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { InjectRepository } from '@nestjs/typeorm';
import { EventInstance } from './entities/event-instance.entity';
import { In, IsNull, Repository } from 'typeorm';
import { FindEventInstanceDto } from './dto/find-event-instance.dto';
import serviceConfig from '../app_config/service.config.json';
import { EventTypeService } from 'src/event-type/event-type.service';
import { AlertService } from 'src/alert/alert.service';
import { Alert } from 'src/alert/entities/alert.entity';
import _ from 'lodash';

@Injectable()
export class EventInstanceService {
  private readonly logger = winstonServerLogger(EventInstanceService.name);
  private relations = serviceConfig.eventInstance.relations;

  private alertEventTypeId: any;

  constructor(
    @InjectRepository(EventInstance) private readonly repo: Repository<EventInstance>,
    private readonly eventTypeService: EventTypeService,
    private readonly alertService: AlertService
  ) { }

  async create(createEventInstanceDto: CreateEventInstanceDto) {
    const fnName = this.create.name;
    const input = `Input : Create EventInstance : ${JSON.stringify(createEventInstanceDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const eventInstance = this.repo.create(createEventInstanceDto);
    return await this.repo.save(eventInstance);
  }

  async createBulk(createEventInstanceDtos: CreateEventInstanceDto[]) {
    const fnName = this.createBulk.name;
    const input = `Input : Create Bulk EventInstance : ${JSON.stringify(createEventInstanceDtos)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const eventInstances = this.repo.create(createEventInstanceDtos);
    return await this.repo.save(eventInstances);
  }

  private async getEventTypeIdByName(eventTypeName: string) {
    if (!this.alertEventTypeId) {
      const alertEventType = this.alertEventTypeId ?? await this.eventTypeService.findOne({
        name: eventTypeName,
      });

      if (!alertEventType) {
        throw new Error(
          `EventType: ${eventTypeName} does not exist. Please create it first.`,
        );
      }

      this.alertEventTypeId = alertEventType.id;
    }
    return this.alertEventTypeId;
  }

  async createEventInstancesForExistingAlerts() {
    const fnName = this.createEventInstancesForExistingAlerts.name;

    this.logger.debug(
      `${fnName}: Starting batch: Create EventInstances for existing Alerts`,
    );

    const eventTypeId = await this.getEventTypeIdByName('Alert');

    let skip = 0;
    const take = 500;
    let created = 0;

    while (true) {
      const alerts = await this.alertService.findAllAlerts(
        skip,
        take,
      );

      this.logger.debug(`Fetched ${alerts.length} open alerts. Skip: ${skip}`);

      if (alerts.length === 0) {
        this.logger.error(`${NO_RECORD}: alerts not found`);
        break;
      }

      // const eventInstancesToBeCreated = alerts.map((alert) =>
      //   this.repo.create({
      //     assetId: alert.assetId,
      //     deviceId: alert.deviceId,
      //     virtualDeviceId: alert.virtualDeviceId,
      //     eventTypeId: eventTypeId,
      //     alertId: alert.id,
      //     startTime: new Date(alert.openDateTime),
      //     endTime: alert.closeDateTime ? new Date(alert.closeDateTime) : undefined,
      //   }),
      // );
      const eventInstancesToBeCreated = alerts.map((alert) => ({
        assetId: alert.assetId,
        deviceId: alert.deviceId,
        virtualDeviceId: alert.virtualDeviceId,
        eventTypeId: eventTypeId,
        alertId: alert.id,
        startTime: new Date(alert.openDateTime),
        endTime: alert.closeDateTime ? new Date(alert.closeDateTime) : undefined,
      }));

      try {
        await this.createBulk(eventInstancesToBeCreated);
        created += eventInstancesToBeCreated.length;

        this.logger.debug(
          `Created ${eventInstancesToBeCreated.length} EventInstances`,
        );
        skip += take;
      } catch (error) {
        this.logger.error(
          `Failed to create EventInstances for batch starting at skip ${skip}`,
          error,
        );
        throw error;
      }
    }
    this.logger.debug(
      `EventInstance batch completed. Total created: ${created}`,
    );

    return {
      created
    };
  }

  async closeEventInstance(id: string) {
    const fnName = this.closeEventInstance.name;
    const input = `Input : Close EventInstance id: ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    this.logger.debug(`${fnName}: Calling update service`);
    return await this.update(id, { endTime: new Date() });
  }

  async createOrCloseInstnceFromAlert(alerts: Alert[]) {
    const fnName = this.createOrCloseInstnceFromAlert.name;
    const input = `Input: alerts : ${JSON.stringify(alerts)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const createdAlerts = [];
    const closedAlerts = [];

    for (const alert of alerts) {
      if (alert.closeDateTime) {
        closedAlerts.push(alert);
      }
      else {
        createdAlerts.push(alert);
      }
    }

    const eventTypeId = await this.getEventTypeIdByName('Alert');
    const eventInstancesToBeCreated: CreateEventInstanceDto[] = []

    if (closedAlerts) {
      const tobeUpdated: UpdateEventInstanceDto[] = [];

      for (const closedAlert of closedAlerts) {

        if (!closedAlert.eventInstance) {
          this.logger.error(
            `${fnName} : ${NO_RECORD} : No EventInstance linked for alertId : ${closedAlert.id}`,
          );

          eventInstancesToBeCreated.push({
            assetId: closedAlert.assetId,
            deviceId: closedAlert.deviceId,
            virtualDeviceId: closedAlert.virtualDeviceId,
            eventTypeId: eventTypeId,
            alertId: closedAlert.id,
            startTime: new Date(closedAlert.openDateTime),
            endTime: closedAlert.closeDateTime ? new Date(closedAlert.closeDateTime) : undefined,
          });
        }
        else {
          tobeUpdated.push({
            id: closedAlert.eventInstance.id,
            endTime: new Date(closedAlert.closeDateTime!),
          });
        }
      }
      if (tobeUpdated) {
        await this.bulkUpdateFromAlert(tobeUpdated);
      }
    }

    if (createdAlerts) {
      const toBeCreated = createdAlerts.map((alert) => ({
        assetId: alert.assetId,
        deviceId: alert.deviceId,
        virtualDeviceId: alert.virtualDeviceId,
        eventTypeId: eventTypeId,
        alertId: alert.id,
        startTime: new Date(alert.openDateTime),
        endTime: alert.closeDateTime ? new Date(alert.closeDateTime) : undefined,
      }));

      eventInstancesToBeCreated.push(...toBeCreated);
    }
    if (eventInstancesToBeCreated) {
      await this.createBulk(eventInstancesToBeCreated);
    }
  }

  async bulkUpdateFromAlert(updateEventInstanceDtos: UpdateEventInstanceDto[]) {
    const fnName = this.bulkUpdateFromAlert.name;
    this.logger.debug(fnName + KEY_SEPARATOR + `Input : ${JSON.stringify(updateEventInstanceDtos)}`);

    const preloadedInstances = [];

    for (const dto of updateEventInstanceDtos) {
      const preloaded = await this.repo.preload(dto);
      if (!preloaded) {
        this.logger.error(`${fnName} : ${NO_RECORD} : EventInstance id : ${dto.id} not found`);
        throw new Error(`${NO_RECORD} : EventInstance id : ${dto.id} not found`);
      }
      preloadedInstances.push(preloaded);
    }

    return await this.repo.save(preloadedInstances);
  }



  // async createEventInstanceOnAlertCreation(alerts: Alert[]) {
  //   const fnName = this.createEventInstanceOnAlertCreation.name;
  //   this.logger.debug(`${fnName}: Creating EventInstances for ${alerts.length} new alerts`);

  //   const eventTypeId = await this.getEventTypeIdByName('Alert');

  //   const eventInstancesToBeCreated = alerts.map((alert) => ({
  //     assetId: alert.assetId,
  //     deviceId: alert.deviceId,
  //     virtualDeviceId: alert.virtualDeviceId,
  //     eventTypeId: eventTypeId,
  //     alertId: alert.id,
  //     startTime: new Date(alert.openDateTime),
  //   }));

  //   return await this.createBulk(eventInstancesToBeCreated);
  // }


  // async updateBulkByAlert(closedAlerts: Alert[]) {
  //   const fnName = this.updateBulkByAlert.name;

  //   if (closedAlerts.length === 0) {
  //     return [];
  //   }

  //   const alertIds = closedAlerts.map(alert => alert.id);

  //   const eventInstances = await this.repo.find({
  //     where: {
  //       alertId: In(alertIds),
  //       endTime: IsNull()
  //     },
  //   });

  //   const eventInstanceMap = new Map(
  //     eventInstances.map(instance => [instance.alertId, instance]),
  //   );

  //   for (const alert of closedAlerts) {
  //     const eventInstance = eventInstanceMap.get(alert.id);

  //     if (!eventInstance) {
  //       this.logger.error(
  //         `${fnName} : EventInstance not found for Alert id : ${alert.id}`,
  //       );
  //       continue;
  //     }

  //     eventInstance.endTime = new Date(alert.closeDateTime!);
  //   }

  //   return await this.repo.save(eventInstances);
  // }

  // async updateBulk(updateEventInstanceDtos: UpdateEventInstanceDto[]) {
  //   const fnName = this.updateBulk.name;
  //   const input = `Input : Update Bulk EventInstance : ${JSON.stringify(updateEventInstanceDtos)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (!updateEventInstanceDtos.length) {
  //     return [];
  //   }

  //   const eventInstances = [];

  //   for (const dto of updateEventInstanceDtos) {
  //     if (!dto.id) {
  //       this.logger.error(`${fnName} : EventInstance Id not found`);
  //       throw new Error('EventInstance Id not found');
  //     }

  //     const eventInstance = await this.repo.preload(dto);

  //     if (!eventInstance) {
  //       this.logger.error(
  //         `${fnName}: ${NO_RECORD} : EventInstance id : ${dto.id} not found`,
  //       );

  //       throw new Error(`${NO_RECORD} : EventInstance id : ${dto.id} not found`);
  //     }

  //     eventInstances.push(eventInstance);
  //   }

  //   return await this.repo.save(eventInstances);
  // }


  private correct = 'correct';
  // async closeEventInstanceByAlert(alerts: Alert[]) {
  //   const fnName = this.closeEventInstanceByAlert.name;
  //   const input = `Input : Close EventInstance for alerts: ${JSON.stringify(alerts.map(alert => alert.id))}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   for (const alert of alerts) {
  //     const eventInstance = await this.findOneById(alert.id);

  //     if (!eventInstance) {
  //       this.logger.error(`${fnName}: No EventInstance found for Alert id: ${alert.id}`);
  //       throw new Error(`No EventInstance found for Alert id: ${alert.id}`);
  //     }
  //     await this.update(eventInstance.id, { endTime: new Date(alert.closeDateTime!) });
  //   }

  //   this.logger.debug(`${fnName}: Closed EventInstances for alerts: ${JSON.stringify(alerts.map(alert => alert.id))}`);
  // } ,


  async closeEventInstanceByAlert(alerts: Alert[]) {
    const fnName = this.closeEventInstanceByAlert.name;

    const alertIds = alerts.map((alert) => alert.id);

    this.logger.debug(
      fnName +
      KEY_SEPARATOR +
      `Input : Close EventInstances for alerts: ${JSON.stringify(alertIds)}`,
    );

    const eventInstances = await this.repo.find({
      where: {
        alertId: In(alertIds),
      },
    });

    const eventInstanceMap = new Map(
      eventInstances.map((eventInstance) => [
        eventInstance.alertId,
        eventInstance,
      ]),
    );

    const eventInstancesToUpdate = [];

    for (const alert of alerts) {
      const eventInstance = eventInstanceMap.get(alert.id);

      if (!eventInstance) {
        this.logger.error(
          `${fnName}: No EventInstance found for Alert id: ${alert.id}`,
        );

        throw new Error(
          `No EventInstance found for Alert id: ${alert.id}`,
        );
      }

      eventInstance.endTime = new Date(alert.closeDateTime!);

      eventInstancesToUpdate.push(eventInstance);
    }

    await this.repo.save(eventInstancesToUpdate);

    this.logger.debug(
      `${fnName}: Closed EventInstances for alerts: ${JSON.stringify(alertIds)}`,
    );
  }


  // async closeEventInstanceByAlert(alerts: Alert[]) {
  //   const fnName = this.closeEventInstanceByAlert.name;

  //   const alertIds = alerts.map((alert) => alert.id);

  //   this.logger.debug(fnName +
  //     KEY_SEPARATOR +
  //     `Input : Close EventInstances for alertIds: ${JSON.stringify(alertIds)}`,
  //   );

  //   const eventInstances = await this.repo.find({
  //     where: {
  //       alertId: In(alertIds),
  //     },
  //   });
  //   const eventInstanceMap = _.groupBy(eventInstances, (eventInstance) => eventInstance.alertId);

  //   const eventInstancesToUpdate = [];

  //   for (const alert of alerts) {
  //     const eventInstance = eventInstanceMap[alert.id];

  //     if (!eventInstance) {
  //       this.logger.error(
  //         `${fnName}: No EventInstance found for Alert id: ${alert.id}`,
  //       );
  //     }

  //     eventInstance[0].endTime = new Date(alert.closeDateTime!);

  //     eventInstancesToUpdate.push(eventInstance);
  //   }

  //   await this.repo.save(eventInstancesToUpdate as UpdateEventInstanceDto[]);

  //   this.logger.debug(
  //     `${fnName}: Closed EventInstances for alerts: ${JSON.stringify(alertIds)}`,
  //   );
  // }

  findAll(
    searchCriteria: FindEventInstanceDto,
    relationsRequired: boolean = false,
  ) {
    const fnName = this.findAll.name;
    const input = `Input : FindAll eventInstance with searchCriteria: ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relation = relationsRequired ? this.relations : []

    return this.repo.find({
      where: searchCriteria,
      relations: relation
    })
  }

  findOne(searchCriteria: FindEventInstanceDto, relationsRequired: boolean = false) {
    const fnName = this.findAll.name;
    const input = `Input : FindOne eventInstance with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relation = relationsRequired ? this.relations : []

    return this.repo.find({
      where: searchCriteria,
      relations: relation
    })
  }

  findOneById(id: string, relationsRequired: boolean = false) {
    const fnName = this.findOneById.name;
    const input = `Input : FindOne eventInstance by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relation = relationsRequired ? this.relations : []

    return this.repo.findOne({
      where: { id },
      relations: relation
    })
  }

  async update(id: string, updateEventInstanceDto: UpdateEventInstanceDto) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, updateEventInstanceDto : ${JSON.stringify(updateEventInstanceDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    if (updateEventInstanceDto.id == null) {
      this.logger.debug(`${fnName} : EventInstance Id not found in updateEventInstanceDto`);
      updateEventInstanceDto.id = id;
    }
    else if (updateEventInstanceDto.id != id) {
      this.logger.error(`${fnName} : EventInstance Id and Update EventInstance Object Id do not match`);
      throw new Error('EventInstance Id and Update EventInstance Object Id do not match');
    }

    const mergedEventInstance = await this.repo.preload(updateEventInstanceDto);

    if (mergedEventInstance == null) {
      this.logger.error(`${fnName}: ${NO_RECORD} : EventInstance id : ${id} not found`);
      throw new Error(`${NO_RECORD} : EventInstance id : ${id} not found`);
    }
    else {
      this.logger.debug(
        `${fnName} : Merged EventInstance is : ${JSON.stringify(mergedEventInstance)}`,
      );

      const savedEventInstance = await this.repo.save(mergedEventInstance);
      this.logger.debug(
        `${fnName} : Saved EventInstance is : ${JSON.stringify(mergedEventInstance)}`,
      );
      return savedEventInstance;
    }
  }


  async delete(id: string) {
    const fnName = this.delete.name;
    const input = `EventInstance Id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);

    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : EventInstance id : ${id} not found`);
      throw new Error(`${NO_RECORD} : EventInstance id : ${id} not found`);
    }
    else {
      this.logger.debug(`${fnName} : EventInstance id : ${id} deleted successfully`);
      return result;
    }
  }

  async softDelete(id: string, userId: string) {
    const fnName = this.softDelete.name;
    const input = `EventInstance Id : ${id} to be softDeleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const eventInstanceToBeDeleted = await this.findOneById(id);

    if (!eventInstanceToBeDeleted) {
      this.logger.error(`${NO_RECORD}: EventInstance id: ${id} not found`);
      throw new Error(`EventInstance id: ${id} not found`);
    }

    eventInstanceToBeDeleted.deletedBy = userId
    await this.repo.save(eventInstanceToBeDeleted);
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      throw new Error(`${fnName} : ${NO_RECORD} : EventInstance id : ${id} not found`);
    }
    else {
      this.logger.debug(
        `${fnName} : EventInstance id : ${id} softDeleted successfully`,
      );
      return result;
    }
  }

  async restore(id: string) {
    const fnName = this.restore.name;
    const input = `Input : EventInstance id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : EventInstance id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : EventInstance id : ${id} not found`);
    }
    else {
      this.logger.debug(`${fnName} EventInstance id : ${id} restored successfully`);
      this.logger.debug(`${fnName}: Calling update service`);
      return this.update(id, { deletedBy: null })  // to make deltedby null we have to change deletedby defination in entity (see entity)
    }
  }
}
