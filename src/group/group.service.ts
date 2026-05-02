import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Response } from 'express';
// import {
//   findAll,
//   deleteRec,
//   softDelete,
//   restore,
// } from 'src/utils/cmnFn.repository';

import serviceConfig from 'src/app_config/service.config.json';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { Asset } from 'src/asset/entities/asset.entity';
import { FindGroupDto } from './dto/find-group.dto';
import { Device } from 'src/device/entities/device.entity';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';

@Injectable()
export class GroupService {
  private serviceName = '';
  // private serviceName = serviceConfig.group.serviceName;
  // private relations = serviceConfig.group.relations;
  private relations = [];
  private readonly logger = winstonServerLogger(GroupService.name);
  constructor(
    @InjectRepository(Group)
    private readonly repo: Repository<Group>,
  ) { }

  async create(createGroupDto: CreateGroupDto, response: Response) {
    const msgTemplate = 'Insert ' + this.serviceName;
    try {
      let result;
      result = await this.repo.findOneBy({
        id: createGroupDto.id,
      });
      if (result) {
        this.logger.info(`${msgTemplate} : ${result.id} already exists`);
        response.status(HttpStatus.OK); //.json(org);
      } else {
        result = await this.repo.save(createGroupDto);
        this.logger.info(`${msgTemplate} : ${JSON.stringify(result)} created`);
      }
      return result;
    } catch (error) {
      this.logger.error(`${msgTemplate} : ${createGroupDto} : ${error}`);
      throw new Error(error as string);
    }
  }


  // group.service.ts

  async findOne(options: any) {
    return this.repo.findOne(options);
  }

  async find(options: any) {
    return this.repo.find(options);
  }

  /* async attachAsset(groupID: string, assetID: string) {
    let msgTemplate;
    let deviceGroup;
    let asset;
    try {
      msgTemplate =
        'Attach asset ' + assetID + ' to ' + groupID + ' ' + this.serviceName;
      deviceGroup = await this.repo.preload({
        id: groupID,
      });
      asset = await this.assetRepo.preload({ id: assetID });
      if (deviceGroup && asset) {
        deviceGroup.asset = asset;
        const result = await this.repo.save(deviceGroup);
        if (result) {
          this.logger.log(`${msgTemplate} completed`);
          return result;
        } else {
          this.logger.error(`${msgTemplate} : failed`);
        }
      } else {
        const errMsg = `${msgTemplate} : ${groupID} Device or ${assetID} asset not available`;
        this.logger.error(errMsg);
        throw new Error(errMsg);
      }
    } catch (error) {
      this.logger.error(`${msgTemplate} ${groupID} : ${assetID} ${error}`);
      throw new Error(error as string);
    }
  } */

  /*  async detachAsset(id: string) {
    let msgTemplate;
    let deviceGroup;
    try {
      msgTemplate = 'Detach asset ' + ' from ' + id + ' ' + this.serviceName;
      deviceGroup = await this.repo.preload({ id: id });
      this.logger.log(`Device instance Group : ${JSON.stringify(deviceGroup)}`);
      if (deviceGroup) {
        await this.repo
          .createQueryBuilder()
          .relation('asset')
          .of(deviceGroup)
          .set(null);
        this.logger.log(`${msgTemplate} completed`);
      } else {
        const errMsg = `${msgTemplate} : ${id} not available`;
        this.logger.error(errMsg);
        throw new Error(errMsg);
      }
    } catch (error) {
      this.logger.error(`${msgTemplate} ${JSON.stringify(deviceGroup)} : ${error}`);
      throw new Error(error as string);
    }
  } */

  // findAll(searchCriteria: FindGroupDto, relationsRequired: boolean = false) {
  //   const msgTemplate = 'Find ' + this.serviceName + 's';
  //   let relations = relationsRequired ? this.relations : [];
  //   return findAll<Group>(this.repo, msgTemplate, relations, searchCriteria);
  // }

  // findAllFromDeviceGroupIDs(
  //   //assetID: string,
  //   csvDeviceGroupIDs: string,
  //   relationsRequired: boolean = false,
  // ) {
  //   //this.logger.log(`csvDeviceGroupIDs : ${csvDeviceGroupIDs}`);
  //   //const msgTemplate = 'Find ' + this.serviceName + 's';
  //   let relations = relationsRequired ? this.relations : [];

  //   return this.repo.find({
  //     relations: relations,
  //     where: {
  //       id: In(csvDeviceGroupIDs.split(',')),
  //       //assetId: assetID,
  //     },
  //   });
  // }

  // /* findAllWthRelations() {
  //   const msgTemplate = 'Find ' + this.serviceName + 's' + ' with relations';
  //   return findAll<DeviceInstanceGroup>(
  //     this.repo,
  //     msgTemplate,
  //     serviceConfig.deviceInstanceGroup.relations,
  //   );
  // } */

  // async findOneById(id: string) {
  //   const msgTemplate = 'Find ' + this.serviceName;
  //   //return findOne<DeviceInstanceGroup>(this.repo, id, msgTemplate, "asset-type");
  //   try {
  //     return await this.repo.findOne({ where: { id: id } });
  //   } catch (error) {
  //     this.logger.error(`${msgTemplate} : ${id} : ${error}`);
  //     throw new Error(error as string);
  //   }
  // }

  // async findOneByIdWthRelations(id: string) {
  //   const msgTemplate = 'Find ' + this.serviceName + ' with relations';
  //   //return findOne<DeviceInstanceGroup>(this.repo, id, msgTemplate, "asset-type", "asset");
  //   try {
  //     return await this.repo.findOne({
  //       where: {
  //         id: id,
  //       },
  //       relations: this.relations,
  //     });
  //   } catch (error) {
  //     this.logger.error(`${msgTemplate} : ${id} : ${error}`);
  //     throw new Error(error as string);
  //   }
  // }

  // async update(id: string, updateDeviceGroupDto: UpdateGroupDto) {
  //   const msgTemplate = 'Update ' + this.serviceName + ' id : ' + id;
  //   try {
  //     this.logger.debug(
  //       `${msgTemplate} : ${JSON.stringify(updateDeviceGroupDto)}`,
  //     );
  //     //const result = await this.repo.update(id, updateDeviceInstanceGroupDto);
  //     const result = await this.repo.save(updateDeviceGroupDto);
  //     this.logger.info(`${msgTemplate} : ${JSON.stringify(result)} saved.`);
  //     return result;
  //   } catch (error) {
  //     this.logger.error(`${msgTemplate} : ${error}`);
  //     throw new Error(error as string);
  //   }
  // }

  // delete(id: string) {
  //   const msgTemplate = 'Delete ' + this.serviceName;
  //   return deleteRec<Group>(this.repo, id, msgTemplate);
  // }

  // softDelete(id: string) {
  //   const msgTemplate = 'Soft delete ' + this.serviceName;
  //   return softDelete<Group>(this.repo, id, msgTemplate);
  // }

  // restore(id: string) {
  //   const msgTemplate = 'Restore ' + this.serviceName;
  //   return restore<Group>(this.repo, id, msgTemplate);
  // }
}
