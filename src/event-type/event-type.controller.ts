import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { EventTypeService } from './event-type.service';
import { CreateEventTypeDto } from './dto/create-event-master.dto';
import { UpdateEventTypeDto } from './dto/update-event-master.dto';
import { FindEventTypeDto } from './dto/find-event-master.dto';
import { UserId } from 'src/utils/req-user-id.decorator';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';

@Controller('event-type')
export class EventTypeController {
  private readonly logger = winstonServerLogger(EventTypeController.name);

  constructor(private readonly eventTypeService: EventTypeService) { }

  @Post()
  create(
    @UserId() userId: string,
    @Body() createEventTypeDto: CreateEventTypeDto
  ) {
    const fnName = this.create.name;
    const input = `Input : Create EventType : ${JSON.stringify(createEventTypeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      createEventTypeDto.createdBy = userId;
      this.logger.debug(`${fnName}: Calling create service`);
      return this.eventTypeService.create(createEventTypeDto);
    }
  }

  @Post('bulk')
  createBulk(
    @UserId() userId: string,
    @Body() createEventTypeDto: CreateEventTypeDto[]
  ) {
    const fnName = this.create.name;
    const input = `Input : Create EventType : ${JSON.stringify(createEventTypeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      for (const dto of createEventTypeDto) {
        dto.createdBy = userId;
      }
      this.logger.debug(`${fnName}: Calling createBulk service`);
      return this.eventTypeService.createBulk(createEventTypeDto);
    }
  }

  @Get()
  findAll(@Query() searchCriteria: FindEventTypeDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find EventType with searchCriteria: ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName}: Calling findAll service`)
    return this.eventTypeService.findAll(searchCriteria);
  }

  @Get('relation')
  findAllWthRelation(@Query() searchCriteria: FindEventTypeDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find EventType with searchCriteria: ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;
    this.logger.debug(`${fnName}: Calling findAll service`)
    return this.eventTypeService.findAll(searchCriteria, relationsRequired);
  }

  @Get('findOne')
  findOne(@Query() searchCriteria: FindEventTypeDto) {
    const fnName = this.findOne.name;
    const input = `Input : FindOne EventType with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName}: Calling findOne service`)
    return this.eventTypeService.findOne(searchCriteria);
  }

  @Get('findOne/relation')
  findOneWthRelation(@Query() searchCriteria: FindEventTypeDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find EventType with searchCriteria: ${JSON.stringify(searchCriteria)} with relation`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;
    this.logger.debug(`${fnName}: Calling findAll service`)
    return this.eventTypeService.findOne(searchCriteria, relationsRequired);
  }

  @Get('id')
  findOneById(@Query('id') id: string) {
    const fnName = this.findOne.name;
    const input = `Input : FindOne EventType by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName}: Calling findOne service`)
    return this.eventTypeService.findOneById(id);
  }

  @Patch()
  update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateEventTypeDto: UpdateEventTypeDto
  ) {
    const fnName = this.findOne.name;
    const input = `Input : Id : ${id}, updateEventTypeDto: ${JSON.stringify(updateEventTypeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      updateEventTypeDto.updatedBy = userId;
      this.logger.debug(`${fnName}: Calling update service`)
      return this.eventTypeService.update(id, updateEventTypeDto);
    }
  }

  @Delete()
  remove(
    @UserId() userId: string,
    @Query('id') id: string
  ) {
    const fnName = this.findOne.name;
    const input = `Input : Delete EventType : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      this.logger.debug(`${fnName}: Calling delete service`)
      return this.eventTypeService.delete(id);
    }
  }

  @Delete('softDelete')
  softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `EventType Id : ${id} to be softDeleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      this.logger.debug(`${fnName}: Calling softDelete service`)
      return this.eventTypeService.softDelete(id, userId);
    }
  }

  @Patch('restore')
  restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.restore.name;
    const input = `Input : EventType id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      return this.eventTypeService.restore(id);
    }
  }

}
