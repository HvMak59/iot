import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EventInstanceService } from './event-instance.service';
import { CreateEventInstanceDto } from './dto/create-event-instance.dto';
import { UpdateEventInstanceDto } from './dto/update-event-instance.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
import { UserId } from 'src/utils/req-user-id.decorator';
import { FindEventInstanceDto } from './dto/find-event-instance.dto';

@Controller('event-instance')
export class EventInstanceController {
  private readonly logger = winstonServerLogger(EventInstanceController.name);

  constructor(private readonly eventInstanceService: EventInstanceService) { }

  @Post()
  create(
    @UserId() userId: string,
    @Body() createEventInstanceDto: CreateEventInstanceDto
  ) {
    const fnName = this.create.name;
    const input = `Input : Create eventInstance : ${JSON.stringify(createEventInstanceDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      createEventInstanceDto.createdBy = userId;
      this.logger.debug(`${fnName}: Calling create service`);
      return this.eventInstanceService.create(createEventInstanceDto);
    }
  }

  @Get()
  findAll(@Query() searchCriteria: FindEventInstanceDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find eventInstance with searchCriteria: ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName}: Calling findAll service`)
    return this.eventInstanceService.findAll(searchCriteria);
  }

  @Get('relation')
  findAllWthRelation(@Query() searchCriteria: FindEventInstanceDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find eventInstance with searchCriteria: ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;
    this.logger.debug(`${fnName}: Calling findAll service`)
    return this.eventInstanceService.findAll(searchCriteria, relationsRequired);
  }

  @Get('findOne')
  findOne(@Query() searchCriteria: FindEventInstanceDto) {
    const fnName = this.findOne.name;
    const input = `Input : FindOne eventInstance with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName}: Calling findOne service`)
    return this.eventInstanceService.findOne(searchCriteria);
  }

  @Get('findOne/relation')
  findOneWthRelation(@Query() searchCriteria: FindEventInstanceDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find eventInstance with searchCriteria: ${JSON.stringify(searchCriteria)} with relation`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;
    this.logger.debug(`${fnName}: Calling findAll service`)
    return this.eventInstanceService.findOne(searchCriteria, relationsRequired);
  }

  @Get('id')
  findOneById(@Query('id') id: string) {
    const fnName = this.findOne.name;
    const input = `Input : FindOne eventInstance by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName}: Calling findOne service`)
    return this.eventInstanceService.findOneById(id);
  }

  @Patch()
  update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateEventInstanceDto: UpdateEventInstanceDto
  ) {
    const fnName = this.findOne.name;
    const input = `Input : Id : ${id}, updateEventInstanceDto: ${JSON.stringify(updateEventInstanceDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      updateEventInstanceDto.updatedBy = userId;
      this.logger.debug(`${fnName}: Calling update service`)
      return this.eventInstanceService.update(id, updateEventInstanceDto);
    }
  }

  @Delete()
  remove(
    @UserId() userId: string,
    @Query('id') id: string
  ) {
    const fnName = this.findOne.name;
    const input = `Input : Delete eventInstance : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      this.logger.debug(`${fnName}: Calling delete service`)
      return this.eventInstanceService.delete(id);
    }
  }

  @Delete('softDelete')
  softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `EventInstance Id : ${id} to be softDeleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      this.logger.debug(`${fnName}: Calling softDelete service`)
      return this.eventInstanceService.softDelete(id, userId);
    }
  }

  @Patch('restore')
  restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.restore.name;
    const input = `Input : EventInstance id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      return this.eventInstanceService.restore(id);
    }
  }
}
