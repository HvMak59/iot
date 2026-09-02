import { Injectable } from '@nestjs/common';
import { CreateEventTypeDto } from './dto/create-event-master.dto';
import { UpdateEventTypeDto } from './dto/update-event-master.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EventType } from './entities/event-type.entity';
import { Repository } from 'typeorm';
import { FindEventTypeDto } from './dto/find-event-master.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import serviceConfig from '../app_config/service.config.json';

@Injectable()
export class EventTypeService {
  private readonly logger = winstonServerLogger(EventTypeService.name);
  private relations = serviceConfig.eventType.relations;

  constructor(
    @InjectRepository(EventType) private readonly repo: Repository<EventType>,
  ) { }

  create(createEventTypeDto: CreateEventTypeDto) {
    const fnName = this.createBulk.name;
    const input = `Input: create eventType: ${JSON.stringify(createEventTypeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const eventMaster = this.repo.create(createEventTypeDto);
    return this.repo.save(eventMaster);
  }

  createBulk(createEventTypeDtos: CreateEventTypeDto[]) {
    const fnName = this.createBulk.name;
    const input = `Input: Bulk create eventType: ${JSON.stringify(createEventTypeDtos)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const records = this.repo.create(createEventTypeDtos);
    return records.length > 0 ? this.repo.save(records) : [];
  }

  async update(id: string, updateEventTypeDto: UpdateEventTypeDto) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, updateEventTypeDto : ${JSON.stringify(updateEventTypeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateEventTypeDto.id == null) {
      this.logger.debug(`${fnName} : EventType Id not found in updateEventTypeDto`);
      updateEventTypeDto.id = id;
    }
    else if (updateEventTypeDto.id != id) {
      this.logger.error(`${fnName}: EventType Id and Update EventType Object Id do not match`);
      throw new Error('EventType Id and Update EventType Object Id do not match');
    }

    const mergedEventType = await this.repo.preload(updateEventTypeDto);

    if (mergedEventType == null) {
      this.logger.error(`${fnName}: ${NO_RECORD} : EventType id : ${id} not found`);
      throw new Error(`${NO_RECORD} : EventType id : ${id} not found`);
    }
    else {
      this.logger.debug(
        `${fnName} : Merged EventType is : ${JSON.stringify(mergedEventType)}`,
      );

      const savedEventType = await this.repo.save(mergedEventType);
      this.logger.debug(
        `${fnName} : Saved EventType is : ${JSON.stringify(mergedEventType)}`,
      );
      return savedEventType;
    }
  }


  findAll(searchCriteria: FindEventTypeDto, relationsRequired: boolean = false) {
    const fnName = this.findAll.name;
    const input = `Input : FindAll eventType with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relation = relationsRequired ? this.relations : []

    return this.repo.find({
      where: searchCriteria,
      relations: relation,
      order: {
        name: 'ASC',
      },
    })
  }

  findOne(searchCriteria: FindEventTypeDto, relationsRequired: boolean = false) {
    const fnName = this.findAll.name;
    const input = `Input : FindOne eventType with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relation = relationsRequired ? this.relations : []

    return this.repo.findOne({
      where: searchCriteria,
      relations: relation
    })
  }

  findOneById(id: string, relationsRequired: boolean = false) {
    const fnName = this.findAll.name;
    const input = `Input : FindOne eventType by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relation = relationsRequired ? this.relations : []

    return this.repo.findOne({
      where: { id },
      relations: relation
    })
  }

  async delete(id: string) {
    const fnName = this.delete.name;
    const input = `eventType Id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);

    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : eventType id : ${id} not found`);
      throw new Error(`${NO_RECORD} : eventType id : ${id} not found`);
    }
    else {
      this.logger.debug(`${fnName} : eventType id : ${id} deleted successfully`);
      return result;
    }
  }

  async softDelete(id: string, userId: string) {
    const fnName = this.softDelete.name;
    const input = `eventType Id : ${id} to be softDeleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const eventTypeToBeDeleted = await this.findOneById(id);

    if (!eventTypeToBeDeleted) {
      this.logger.error(`${NO_RECORD}: eventType id: ${id} not found`);
      throw new Error(`eventType id: ${id} not found`);
    }

    eventTypeToBeDeleted.deletedBy = userId
    await this.repo.save(eventTypeToBeDeleted);
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      throw new Error(`${fnName} : ${NO_RECORD} : eventType id : ${id} not found`);
    }
    else {
      this.logger.debug(
        `${fnName} : eventType id : ${id} softDeleted successfully`,
      );
      return result;
    }
  }

  async restore(id: string) {
    const fnName = this.restore.name;
    const input = `Input : eventType id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : eventType id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : eventType id : ${id} not found`);
    }
    else {
      this.logger.debug(`${fnName} eventType id : ${id} restored successfully`);
      this.logger.debug(`${fnName}: Calling update service`);
      return this.update(id, { deletedBy: null }) // to make deltedby null we have to change deletedby defination in entity (see entity)
    }
  }
}
