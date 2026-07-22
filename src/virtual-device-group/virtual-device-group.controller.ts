import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { VirtualDeviceGroupService } from './virtual-device-group.service';
import { CreateVirtualDeviceGroupDto } from './dto/create-virtual-device-group.dto';
import { UpdateVirtualDeviceGroupDto } from './dto/update-virtual-device-group.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { getTryCatchErrorStr } from 'src/utils/others';
import { FindVirtualDeviceGroupDto } from './dto/find-virtual-device-group.dto';
import { FindVirtualDeviceDTOByMultipleIDs } from './dto/find-virtual-device-group-byMultipleIDs.dto';
import { Public } from 'src/auth/entities/public_route';

@Controller('virtual-device-group')
export class VirtualDeviceGroupController {
  private readonly logger = winstonServerLogger(
    VirtualDeviceGroupController.name,
  );
  constructor(
    private readonly virtualDeviceGroupService: VirtualDeviceGroupService,
  ) { }

  @Post()
  async create(
    @Body() createVirtualDeviceGroupDto: CreateVirtualDeviceGroupDto,
  ) {
    const fnName = 'create()';
    const input = `Input : ${JSON.stringify(createVirtualDeviceGroupDto)}`;
    const msgTemplate = fnName + KEY_SEPARATOR + input;
    try {
      this.logger.debug(msgTemplate + ' Start');
      return await this.virtualDeviceGroupService.create(
        createVirtualDeviceGroupDto,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(msgTemplate + errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(msgTemplate + ' End');
    }
  }

  //   /*  @Get('repo')
  //   getRepo() {
  //     return this.virtualDeviceGroupService.getRepo();
  //   } */

  //   @Get()
  //   async findAll(@Query() searchCriteria: FindVirtualDeviceGroupDto) {
  //     const fnName = 'findAll()';
  //     const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //     const msgTemplate = fnName + KEY_SEPARATOR + input;
  //     try {
  //       this.logger.debug(msgTemplate + ' Start');
  //       return await this.virtualDeviceGroupService.findAll(searchCriteria);
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(msgTemplate + errMsg);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(msgTemplate + ' End');
  //     }
  //   }

  //   @Get('relations')
  //   async findAllWithRelations(
  //     @Query() searchCriteria: FindVirtualDeviceGroupDto,
  //   ) {
  //     const fnName = 'findAllWithRelations()';
  //     const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //     const msgTemplate = fnName + KEY_SEPARATOR + input;
  //     try {
  //       const relationsRequired = true;
  //       this.logger.debug(msgTemplate + ' Start');
  //       return await this.virtualDeviceGroupService.findAll(
  //         searchCriteria,
  //         relationsRequired,
  //       );
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(msgTemplate + errMsg);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(msgTemplate + ' End');
  //     }
  //   }

  //   @Get('findOne')
  //   async findOne(@Query() searchCriteria: FindVirtualDeviceGroupDto) {
  //     const fnName = 'findOne()';
  //     const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //     const msgTemplate = fnName + KEY_SEPARATOR + input;
  //     try {
  //       this.logger.debug(msgTemplate + ' Start');
  //       return await this.virtualDeviceGroupService.findOne(searchCriteria);
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(
  //         `findOne() : Input : ${JSON.stringify(searchCriteria)}, ${errMsg}`,
  //       );
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(msgTemplate + ' End');
  //     }
  //   }

  //   @Get('findOne/relations')
  //   async findOneWithRelations(
  //     @Query() searchCriteria: FindVirtualDeviceGroupDto,
  //   ) {
  //     const fnName = 'findOne()';
  //     const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //     const msgTemplate = fnName + KEY_SEPARATOR + input;
  //     try {
  //       const relationsRequired = true;
  //       this.logger.debug(msgTemplate + ' Start');
  //       return await this.virtualDeviceGroupService.findOne(
  //         searchCriteria,
  //         relationsRequired,
  //       );
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(
  //         `findOne() : Input : ${JSON.stringify(searchCriteria)}, ${errMsg}`,
  //       );
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(msgTemplate + ' End');
  //     }
  //   }

  //   @Public()
  //   @Get('multipleIDs')
  //   async findByMultipleIDs(
  //     @Query() searchCriteria: FindVirtualDeviceDTOByMultipleIDs,
  //   ) {
  //     const fnName = 'findByMultipleIDs()';
  //     const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //     const msgTemplate = fnName + KEY_SEPARATOR + input;
  //     try {
  //       this.logger.debug(msgTemplate + ' Start');
  //       return await this.virtualDeviceGroupService.findByMultipleIDs(
  //         searchCriteria,
  //       );
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(
  //         `${msgTemplate} : ${JSON.stringify(searchCriteria)}, ${errMsg}`,
  //       );
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   }

  //   /*  @Get('byCSVVirtualDeviceIDsWithChildren')
  //   async findByCSVVirtualDeviceIDsWithChildren(
  //     @Query('csvVirtualDeviceIDs') csvVirtualDeviceIDs: string,
  //   ) {
  //     const fnName = 'findByCSVVirtualDeviceIDsWithChildren()';
  //     const input = `Input : ${csvVirtualDeviceIDs}`;
  //     const msgTemplate = fnName + KEY_SEPARATOR + input;
  //     try {
  //       this.logger.debug(msgTemplate + ' Start');
  //       return await this.virtualDeviceGroupService.findByCSVVirtualDeviceIDsWithChildren(
  //         csvVirtualDeviceIDs,
  //       );
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(msgTemplate + ' End');
  //     }
  //   } */

  //   @Delete('softDelete/:id')
  //   async softDelete(@Param('id') id: string) {
  //     const fnName = 'softDelete()';
  //     const input = `Input : ${id}`;
  //     const msgTemplate = fnName + KEY_SEPARATOR + input;
  //     this.logger.debug(msgTemplate + ' Start');
  //     try {
  //       return await this.virtualDeviceGroupService.softDelete(id);
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`Delete() : Input : ${id}, ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(msgTemplate + ' End');
  //     }
  //   }

  //   @Delete(':id')
  //   async remove(@Param('id') id: string) {
  //     const fnName = 'remove()';
  //     const input = `Input : ${id}`;
  //     const msgTemplate = fnName + KEY_SEPARATOR + input;
  //     this.logger.debug(msgTemplate + ' Start');
  //     try {
  //       return await this.virtualDeviceGroupService.delete(id);
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`Delete() : Input : ${id}, ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(msgTemplate + ' End');
  //     }
  //   }

  //   @Patch('restore/:id')
  //   async restore(@Param('id') id: string) {
  //     const fnName = 'remove()';
  //     const input = `restore : ${id}`;
  //     const msgTemplate = fnName + KEY_SEPARATOR + input;
  //     this.logger.debug(msgTemplate + ' Start');
  //     try {
  //       return await this.virtualDeviceGroupService.restore(id);
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`Delete() : Input : ${id}, ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(msgTemplate + ' End');
  //     }
  //   }
  //   @Patch()
  //   update(
  //     //@Query('id') id: string,
  //     @Body() updateVirtualDeviceGroupDto: UpdateVirtualDeviceGroupDto,
  //   ) {
  //     const fnName = 'update()';
  //     const input = JSON.stringify(updateVirtualDeviceGroupDto);
  //     this.logger.debug(fnName + ' Start');
  //     this.logger.debug(fnName + ' Input : ' + input);
  //     //try {
  //     return this.virtualDeviceGroupService.update(
  //       //id,
  //       updateVirtualDeviceGroupDto,
  //     );
  //   }

  //   @Patch('updateFromVirtualDevice')
  //   updateFromVirtualDevice(
  //     @Query('virtualDeviceId') virtualDeviceId: string,
  //     @Body() updateVirtualDeviceGroupDTOs: UpdateVirtualDeviceGroupDto[],
  //   ) {
  //     const fnName = 'update()';
  //     const input = `Virtual device id : ${virtualDeviceId} : Update from VDG :  ${JSON.stringify(
  //       [...updateVirtualDeviceGroupDTOs],
  //     )}`;
  //     this.logger.debug(fnName + ' Start');
  //     this.logger.debug(fnName + ' Input : ' + input);
  //     //try {
  //     return this.virtualDeviceGroupService.updateFromVirtualDevice(
  //       virtualDeviceId,
  //       updateVirtualDeviceGroupDTOs,
  //     );
  //   }
}
