// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Query,
//   Put,
//   Res,
//   UseInterceptors,

import { Body, Controller, Post } from "@nestjs/common";
import { VirtualDeviceService } from "./virtual-device.service";
import { UserId } from "src/utils/req-user-id.decorator";
import { Token } from "src/utils/token.decorator";
import { CreateVirtualDeviceDto } from "./dto/create-virtual-device.dto";
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from "src/app_config/constants";
import { winstonServerLogger } from "src/app_config/serverWinston.config";

// } from '@nestjs/common';
// import { VirtualDeviceService } from './virtual-device.service';
// import { CreateVirtualDeviceDto } from './dto/create-virtual-device.dto';
// import { UpdateVirtualDeviceDto } from './dto/update-virtual-device.dto';
// // import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { FindVirtualDeviceDto } from './dto/find-virtual-device.dto';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config (1)';
// import { UserId } from 'src/utils/req-user-id-decorator';
// import { Token } from 'src/user/token.decorator';
// import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
// import { AuthService } from 'src/auth/auth.services';
// // import { Public } from 'src/auth/entities/public_route';
// // import { UserId } from 'src/utils/req-user-id.decorator';
// // import { Token } from 'src/utils/token.decorator';
// // import { Relations } from 'src/utils/enums';

@Controller('virtual-device')
export class VirtualDeviceController {
  constructor(
    private readonly virtualDeviceService: VirtualDeviceService,
    // private readonly authService: AuthService
  ) { }
  private readonly logger = winstonServerLogger(VirtualDeviceController.name);
  @Post()
  async create(
    @UserId() userId: string,
    @Token() token: string,
    @Body() createVirtualDeviceDto: CreateVirtualDeviceDto,
  ) {
    const fnName = 'create()';
    const input = `Input : ${JSON.stringify(createVirtualDeviceDto)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(`${fnName} : User is not available in reaquest header`);
      throw new Error(`${fnName} : ${USER_NOT_IN_REQUEST_HEADER}`);
    }
    else {
      // const isToken = await this.authService.verifyToken(token);
      // this.logger.debug(`Token : ${isToken}`);

      createVirtualDeviceDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create service`);
      return await this.virtualDeviceService.create(createVirtualDeviceDto, token);
    }
  }

  //   @Patch()
  //   async update(
  //     @UserId() userId: string,
  //     @Token() token: string,
  //     @Query('id') id: string,
  //     @Body() updateVirtualDeviceDto: UpdateVirtualDeviceDto,
  //   ) {
  //     const fnName = 'update()';
  //     const input = `Input :${JSON.stringify(updateVirtualDeviceDto)}`;

  //     this.logger.debug(fnName + KEY_SEPARATOR + input);

  //     if (userId == null) {
  //       this.logger.error(`${fnName} : User is not available in request header`);
  //       throw Error(`${fnName} :  ${USER_NOT_IN_REQUEST_HEADER}`);
  //     }
  //     else {
  //       // const isToken = await this.authService.verifyToken(token);
  //       // this.logger.debug(`Token : ${isToken}`);

  //       updateVirtualDeviceDto.updatedBy = userId;
  //       this.logger.debug(`${fnName} : Calling Update Service`);

  //       return await this.virtualDeviceService.update(id, updateVirtualDeviceDto, token);
  //     }
  //   }


  //   @Get()
  //   async findAll(@Query() searchCriteria: FindVirtualDeviceDto) {
  //     const fnName = 'findAll()';
  //     const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //     this.logger.debug(`${fnName} : ${input}`);
  //     return await this.virtualDeviceService.findAll(searchCriteria);
  //   }

  //   @Get('withChildren')
  //   async getVirtualDeviceWithChildren(@Query('assetId') assetId?: string) {
  //     const fnName = 'getVirtualDeviceWithChildren()';
  //     this.logger.debug(fnName);

  //     return await this.virtualDeviceService.getVirtualDeviceWithChildren(assetId);
  //   }

  //   // @Get('minRelations')
  //   // async findAllWithMinRelations(@Query() searchCriteria: FindVirtualDeviceDto) {
  //   //   const fnName = 'findAllWithRelations()';
  //   //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   //   this.logger.debug(`${fnName} : ${input}`);
  //   //   const relationsRequired = true;
  //   //   return await this.virtualDeviceService.findAll(
  //   //     searchCriteria,
  //   //     // Relations.MIN,
  //   //   );
  //   // }

  //   // @Get('allRelations')
  //   // async findAllWithAllRelations(@Query() searchCriteria: FindVirtualDeviceDto) {
  //   //   const fnName = 'findAllWithRelations()';
  //   //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   //   this.logger.debug(`${fnName} : ${input}`);
  //   //   const relationsRequired = true;
  //   //   return await this.virtualDeviceService.findAll(
  //   //     searchCriteria,
  //   //     // Relations.ALL,
  //   //   );
  //   // }

  //   // @Get('findOne')
  //   // async findOne(@Query() searchCriteria: FindVirtualDeviceDto) {
  //   //   const fnName = 'findOne()';
  //   //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   //   this.logger.debug(`${fnName} : ${input}`);
  //   //   return await this.virtualDeviceService.findOne(searchCriteria);
  //   // }

  //   // @Get('findOne/relations')
  //   // async findOneWithRelations(@Query() searchCriteria: FindVirtualDeviceDto) {
  //   //   const fnName = 'findOneWithRelations()';
  //   //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   //   this.logger.debug(`${fnName} : ${input}`);
  //   //   const relationsRequired = true;
  //   //   return await this.virtualDeviceService.findOne(
  //   //     searchCriteria,
  //   //     relationsRequired,
  //   //   );
  //   // }

  //   // // @Public()
  //   // @Get('childrenFromParentIDs')
  //   // async findChildrenFromCSVParentIDs(
  //   //   @Query('csvParentIDs') csvParentIDs: string,
  //   // ) {
  //   //   const fnName = 'findChildrenFromCSVParentIDs()';
  //   //   const input = `Input : ${csvParentIDs}`;
  //   //   this.logger.debug(`${fnName} : ${input}`);
  //   //   return await this.virtualDeviceService.findChildrenFromCSVParentIDs(
  //   //     csvParentIDs,
  //   //   );
  //   // }

  //   // /* @Get('findOneById')
  //   // findOneById(@Query('id') id: string) {
  //   //   try {
  //   //     return this.virtualDeviceService.findOne(id);
  //   //   } catch (error) {
  //   //     const errMsg = getTryCatchErrorStr(error);
  //   //     this.logger.error(`findOneById() : Input : ${id}, ${errMsg}`);
  //   //     throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //   //   }
  //   // } */

  //   // @Delete('softDelete/:id')
  //   // async softDelete(@Param('id') id: string) {
  //   //   const fnName = 'softDelete()';
  //   //   const input = `Input : Virtual Device Id : ${id}`;
  //   //   this.logger.debug(`${fnName} : ${input}`);
  //   //   return await this.virtualDeviceService.softDelete(id);
  //   // }

  //   // @Delete(':id')
  //   // async remove(@Param('id') id: string) {
  //   //   const fnName = 'remove()';
  //   //   const input = `Input : Virtual Device Id : ${id}`;
  //   //   this.logger.debug(`${fnName} : ${input}`);
  //   //   return await this.virtualDeviceService.delete(id);
  //   // }

  //   // @Patch('restore/:id')
  //   // async restore(@Param('id') id: string) {
  //   //   const fnName = 'restore()';
  //   //   const input = `Input : Virtual Device Id : ${id}`;
  //   //   this.logger.debug(`${fnName} : ${input}`);
  //   //   return await this.virtualDeviceService.restore(id);
  //   // }

  //   // @Put('attach-device')
  //   // async attachEntireDevice(@Body() virtualDevice: VirtualDevice) {
  //   //   const fnName = 'attachEntireDevice()';
  //   //   const input = `Input : ${JSON.stringify(virtualDevice)}`;
  //   //   this.logger.debug(`${fnName} : ${input}`);
  //   //   return await this.virtualDeviceService.attachEntireDevice(virtualDevice);
  //   // }


  //   // @Get('findOneById')
  //   // findOneById(@Query('id') id: string) {
  //   //   this.logger.debug('calling findonebyd service')
  //   //   return this.virtualDeviceService.findOneById(id);

  //   // }

  //   /* Update updatedBy */
  //   @Patch('attach-device')
  //   async attachDevice(
  //     @UserId() userId: string,
  //     @Token() token: string,
  //     @Query('id') id: string,
  //     @Query('deviceId') deviceId: string,
  //     @Query('clientDeviceId') clientDeviceId: string,

  //     @Query('IMEI') IMEI?: string,
  //     @Query('validateIMEI') validateIMEI?: boolean,
  //     @Query('phoneNumber') phoneNumber?: string,
  //   ) {
  //     const fnName = 'attachDevice()';
  //     const input = `${fnName} Input : Attach VirtualDeviceId : ${id} with Device where deviceId : ${deviceId}, clientDeviceId : ${clientDeviceId}, IMEI : ${IMEI}, validateIMEI : ${validateIMEI}, phoneNumber : ${phoneNumber}`;

  //     this.logger.debug(fnName + KEY_SEPARATOR + input);

  //     if (userId == null) {
  //       this.logger.error(`${fnName} : User is not available in request header`);
  //       throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //     }
  //     else {
  //       validateIMEI = Boolean(validateIMEI);

  //       this.logger.debug(`${fnName} : Calling attach device service`);
  //       return await this.virtualDeviceService.attachDevice(token, userId, id, deviceId, clientDeviceId, IMEI, validateIMEI, phoneNumber);
  //     }
  //   }

  //   /* Update updatedBy */
  //   @Patch('detach-device')
  //   async detachDevice(
  //     @UserId() userId: string,
  //     @Token() token: string,
  //     @Query('id') id: string
  //   ) {
  //     const fnName = 'detachDevice()';
  //     const input = `${fnName} Input : Detach Device from VirtualDeviceId : ${id}`;

  //     this.logger.debug(fnName + KEY_SEPARATOR + input);

  //     if (userId == null) {
  //       this.logger.error(`${fnName} : User is not available in request header`);
  //       throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //     }
  //     else {
  //       this.logger.debug(`${fnName} : Calling detach device service`);
  //       return await this.virtualDeviceService.detachDevice(token, userId, id);
  //     }
  //   }

  //   // @Delete()
  //   // async remove(@UserId() userId: string, @Token() token: string, @Query('id') id: string) {
  //   //   const fnName = 'delete()';
  //   //   const input = `VirtualDevic Id : ${id} to be deleted`;

  //   //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   //   if (userId == null) {
  //   //     this.logger.error(`${fnName} : User is not available in request header`);
  //   //     throw Error(`${fnName} : ${USER_NOT_IN_REQUEST_HEADER}`);
  //   //   }
  //   //   else {
  //   //     this.logger.debug(`${fnName} : Calling delete service`);

  //   //     return await this.virtualDeviceService.delete(id, token);
  //   //   }
  //   // }

  //   // @Delete('softDelete/:id')     changed from param to query
  //   // @Delete('softDelete')
  //   // async softDelete(@UserId() userId: string, @Query('id') id: string) {
  //   //   const fnName = 'softDelete()';
  //   //   const input = `VirtualDevice Id : ${id} to be softDeleted`;

  //   //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   //   if (userId == null) {
  //   //     this.logger.error(`${fnName} : User is not available in request header`);
  //   //     throw Error(`${fnName} : ${USER_NOT_IN_REQUEST_HEADER}`);
  //   //   }
  //   //   else {
  //   //     let virtualDeviceToBeSoftDeleted = await this.virtualDeviceService.findOneById(id);
  //   //     // this.logger.debug(`to be soft deleted : ${JSON.stringify(userToBeSoftDeleted)}`);
  //   //     if (virtualDeviceToBeSoftDeleted) {
  //   //       virtualDeviceToBeSoftDeleted.deletedBy = userId;
  //   //       this.logger.debug(`${fnName} : Calling softDelete service`);
  //   //       return await this.virtualDeviceService.softDelete(id, virtualDeviceToBeSoftDeleted);
  //   //     }
  //   //     else {
  //   //       throw new Error(`${fnName} : User id ${id} not found`);
  //   //     }
  //   //   }
  //   // }

  //   // @Patch('restore/:id')   changed from param to query      
  //   // @Patch('restore')          // this service is still pending
  //   // async restore(
  //   //   @UserId() userId: string,
  //   //   @Token() token: string,
  //   //   @Query('id') id: string,
  //   //   @Body() restoreUser: UpdateVirtualDeviceDto
  //   // ) {
  //   //   const fnName = 'restore()';
  //   //   const input = `Input : VirtualDevice id : ${id} to be restored`;

  //   //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   //   if (userId == null) {
  //   //     this.logger.error(`${fnName} : User is not availabe in request header`);
  //   //     throw Error(`${fnName} : ${USER_NOT_IN_REQUEST_HEADER}`);
  //   //   }
  //   //   else {
  //   //     this.logger.debug(`${fnName} : Calling restore service`);
  //   //     const restored = await this.virtualDeviceService.restore(id, token, restoreUser);
  //   //     return restored;
  //   //   }
  //   // }

}


