import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { In, Repository } from 'typeorm';
import { CreateVirtualDeviceGroupDto } from './dto/create-virtual-device-group.dto';
import { UpdateVirtualDeviceGroupDto } from './dto/update-virtual-device-group.dto';
import { VirtualDeviceGroup } from './entities/virtual-device-group.entity';

import serviceConfig from 'src/app_config/service.config.json';
import { FindVirtualDeviceGroupDto } from './dto/find-virtual-device-group.dto';
// import {
//   deleteRec,
//   findAll,
//   restore,
//   softDelete,
// } from 'src/utils/cmnFn.repository';
import { FindVirtualDeviceDTOByMultipleIDs } from './dto/find-virtual-device-group-byMultipleIDs.dto';
import { NO_RECORD } from 'src/app_config/constants';
import _ from 'lodash';
import { VirtualDeviceGroupComparator } from 'src/utils/others';

@Injectable()
export class VirtualDeviceGroupService {
  constructor(
    @InjectRepository(VirtualDeviceGroup)
    private readonly repo: Repository<VirtualDeviceGroup>,
  ) { }
  private readonly logger = winstonServerLogger(VirtualDeviceGroupService.name);
  // private readonly relations = serviceConfig.virtualDeviceGroup.relations;
  private readonly relations = [];
  create(createVirtualDeviceGroupDto: CreateVirtualDeviceGroupDto) {
    const virtualDeviceGroupObj = this.repo.create(createVirtualDeviceGroupDto);
    return this.repo.save(virtualDeviceGroupObj);
  }

  // findAll(
  //   searchCriteria: FindVirtualDeviceGroupDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const msgTemplate = `findAll() Input : ${JSON.stringify(
  //     searchCriteria,
  //     null,
  //     2,
  //   )}`;
  //   const relations = relationsRequired ? this.relations : [];
  //   // return findAll<VirtualDeviceGroup>(
  //   //   this.repo,
  //   //   msgTemplate,
  //   //   relations,
  //   //   searchCriteria,
  //   // );
  // }

  // /* getRepo() {
  //   return this.repo;
  // } */

  async find(options?: FindVirtualDeviceGroupDto) {
    // return this.repo.find(options);
    return this.repo.find({ where: options })
  }

  // async getGroupsByParentVirtualDevice(
  //   childVirtualDeviceIds: string[],
  // ): Promise<VirtualDeviceGroup[]> {

  //   const fnName = 'getGroupsByParentVirtualDevice()';

  //   try {

  //     this.logger.debug(`${fnName} : Start`);

  //     if (!childVirtualDeviceIds.length) {
  //       return [];
  //     }

  //     const virtualDeviceGroups = await this.repo.find({

  //       where: {
  //         virtualDeviceId: In(childVirtualDeviceIds),
  //       },

  //       relations: {

  //         group: {

  //           groupMetricsAttributeAggregations: {

  //             metricsAttributeAggregation: true,

  //           },

  //         },

  //       },

  //     });

  //     this.logger.debug(
  //       `${fnName} : ${virtualDeviceGroups.length} VirtualDeviceGroups Found`,
  //     );

  //     return virtualDeviceGroups;

  //   } catch (error) {

  //     this.logger.error(
  //       `${fnName} : ${error.message}`,
  //     );

  //     throw error;

  //   } finally {

  //     this.logger.debug(`${fnName} : End`);

  //   }

  // }





  async findByVirtualDevice(parentVirtualDeviceId: string): Promise<VirtualDeviceGroup[]> {
    return this.repo.find({ where: { virtualDeviceId: parentVirtualDeviceId } });
  }



  // findOne(
  //   searchCriteria: FindVirtualDeviceGroupDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const msgTemplate = `findOne() : Input : ${JSON.stringify(searchCriteria)}`;
  //   const relations = relationsRequired ? this.relations : [];
  //   return this.repo.findOne({ where: searchCriteria, relations: relations });
  // }

  // findByMultipleIDs(searchCriteria: FindVirtualDeviceDTOByMultipleIDs) {
  //   const searchObj: FindVirtualDeviceGroupDto = {};
  //   searchCriteria.csvVirtualDeviceIDs
  //     ? (searchObj.virtualDeviceId = In(
  //       searchCriteria.csvVirtualDeviceIDs.split(','),
  //     ))
  //     : null;
  //   searchCriteria.csvGroupIDs
  //     ? (searchObj.groupId = In(searchCriteria.csvGroupIDs.split(',')))
  //     : null;

  //   return this.findAll(searchObj);
  // }

  // /*  findByCSVVirtualDeviceIDsWithChildren(csvVirtualDeviceIDs: string) {
  //   const searchObj: FindVirtualDeviceGroupDto = {};

  //   return this.repo.find({
  //     where: {
  //       virtualDeviceId: In(csvVirtualDeviceIDs.split(',')),
  //     },
  //     relations: {
  //       virtualDevice: {
  //         children: true,
  //       },
  //     },
  //   });
  // } */

  // async update(updateVirtualDeviceGroupDto: UpdateVirtualDeviceGroupDto) {
  //   const fnName = 'update()';
  //   const virtualDeviceGroupObj = await this.repo.preload(
  //     updateVirtualDeviceGroupDto,
  //   );
  //   if (virtualDeviceGroupObj == null) {
  //     this.logger.error(
  //       `${fnName} : ${JSON.stringify(virtualDeviceGroupObj)} not found}`,
  //     );
  //     throw new Error(
  //       `${NO_RECORD} : ${JSON.stringify(virtualDeviceGroupObj)} not found}`,
  //     );
  //   } else {
  //     return await this.repo.save(virtualDeviceGroupObj);
  //   }
  // }

  // async updateFromVirtualDevice(
  //   virtualDeviceId: string,
  //   updateVirtualDeviceGroupDTOs: UpdateVirtualDeviceGroupDto[],
  // ) {
  //   const fnName = 'updateFromVirtualDevice()';
  //   const currentVDGs = await this.findAll({
  //     virtualDeviceId: virtualDeviceId,
  //   });
  //   this.logger.debug(
  //     `${fnName} : Current VDGs are : ${JSON.stringify(currentVDGs)}`,
  //   );
  //   /* const arrivedVDGs: VirtualDeviceGroup[] = [];
  //   for (const updateVirtualDeviceDto of updateVirtualDeviceGroupDTOs) {
  //     const arrivedVDG = this.repo.create(updateVirtualDeviceDto);
  //     arrivedVDGs.push(arrivedVDG);
  //   } 
  //   this.logger.debug(
  //     `${fnName} : Arrived VDGs are : ${JSON.stringify(arrivedVDGs)}`,
  //   );*/
  //   const newVDGs = _.differenceBy(
  //     updateVirtualDeviceGroupDTOs,
  //     currentVDGs,
  //     (vdg) => {
  //       const vdgObj = new VirtualDeviceGroup(vdg);
  //       return vdgObj.getKey();
  //     },
  //   );
  //   this.logger.debug(
  //     `${fnName} : New VDGs are : ${JSON.stringify([...newVDGs])}`,
  //   );
  //   const tobeDeletedVDGs = _.differenceBy(
  //     currentVDGs,
  //     updateVirtualDeviceGroupDTOs,
  //     (vdg) => {
  //       const vdgObj = new VirtualDeviceGroup(vdg);
  //       return vdgObj.getKey();
  //     },
  //   );
  //   this.logger.debug(
  //     `${fnName} : VDGs to be deleted are : ${JSON.stringify([
  //       ...tobeDeletedVDGs,
  //     ])}`,
  //   );

  //   for (const newVDG of newVDGs) {
  //     newVDG.virtualDeviceId = virtualDeviceId;
  //     const createdVDG = await this.create(newVDG);
  //     if (createdVDG) {
  //       this.logger.debug(
  //         `${fnName} : ${JSON.stringify(createdVDG)} created successfully`,
  //       );
  //     } else {
  //       this.logger.debug(
  //         `${fnName} : ${JSON.stringify(createdVDG)} could not be created`,
  //       );
  //     }
  //   }

  //   for (const tobeDeletedVDG of tobeDeletedVDGs) {
  //     const deletedVDG = await this.delete(tobeDeletedVDG.id);
  //     if (
  //       deletedVDG != null &&
  //       deletedVDG.affected != null &&
  //       deletedVDG.affected > 0
  //     ) {
  //       this.logger.debug(
  //         `${fnName} : ${JSON.stringify(deletedVDG)} deleted successfully`,
  //       );
  //     } else {
  //       this.logger.debug(
  //         `${fnName} : ${JSON.stringify(
  //           deletedVDG,
  //         )} not found and could not be deleted`,
  //       );
  //     }
  //   }
  //   return true;
  // }

  // delete(id: string) {
  //   const msgTemplate = 'Delete ' + id;
  //   return deleteRec<VirtualDeviceGroup>(this.repo, id, msgTemplate);
  // }

  // softDelete(id: string) {
  //   const msgTemplate = 'Soft delete ' + id;
  //   return softDelete<VirtualDeviceGroup>(this.repo, id, msgTemplate);
  // }

  // restore(id: string) {
  //   const msgTemplate = 'Restore ' + id;
  //   return restore<VirtualDeviceGroup>(this.repo, id, msgTemplate);
  // }
}
