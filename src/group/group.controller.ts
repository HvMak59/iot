import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { FindGroupDto } from './dto/find-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) { }

  @Post()
  create(
    @Body() createGroupDto: CreateGroupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.groupService.create(createGroupDto, response);
  }

  //   @Get()
  //   findAll(@Query() searchCriteria: FindGroupDto) {
  //     return this.groupService.findAll(searchCriteria);
  //   }

  //   @Get('relations')
  //   findAllWthRelations(@Query() searchCriteria: FindGroupDto) {
  //     const relationsRequired = true;
  //     return this.groupService.findAll(searchCriteria, relationsRequired);
  //   }

  //   @Get('assetID/csvDeviceGroupIDs')
  //   findAllFromDeviceGroupIDs(
  //     @Query('csvDeviceGroupIDs') csvDeviceGroupIDs: string,
  //     @Query('assetID') assetID: string,
  //   ) {
  //     const relationsRequired = true;
  //     return this.groupService.findAllFromDeviceGroupIDs(
  //       //assetID,
  //       csvDeviceGroupIDs,
  //       relationsRequired,
  //     );
  //   }

  //   @Get(':id')
  //   findOneById(@Param('id') id: string) {
  //     return this.groupService.findOneById(id);
  //   }

  //   @Get('relations/:id')
  //   findOneByIdWithRelations(@Param('id') id: string) {
  //     return this.groupService.findOneByIdWthRelations(id);
  //   }

  //   @Patch(':id')
  //   update(
  //     @Param('id') id: string,
  //     @Body() updateDeviceGroupDto: UpdateGroupDto,
  //   ) {
  //     return this.groupService.update(id, updateDeviceGroupDto);
  //   }

  //   /* @Patch('attach-asset/:id/:assetID')
  //   attachAsset(@Param('id') id: string, @Param('assetID') assetID: string) {
  //     return this.groupService.attachAsset(id, assetID);
  //   }

  //   @Patch('detach-asset/:id')
  //   detachAsset(@Param('id') id: string) {
  //     return this.groupService.detachAsset(id);
  //   } */

  //   @Patch('restore/:id')
  //   restore(@Param('id') id: string) {
  //     return this.groupService.restore(id);
  //   }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.groupService.delete(id);
  //   }

  //   @Delete('softDelete/:id')
  //   softDelete(@Param('id') id: string) {
  //     return this.groupService.softDelete(id);
  //   }
}
