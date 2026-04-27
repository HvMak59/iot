import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrgUser } from './entities/org-user.entity';

import serviceConfig from '../app_config/service.config.json';
import _ from 'lodash';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { CreateOrgUserDto } from './dto/create-org-user.dto';
import { FindOrgUserDto } from './dto/find-org-user.dto';
import { UpdateOrgUserDto } from './dto/update-org-user.dto';


@Injectable()
export class OrgUserService {
  private logger = winstonServerLogger(OrgUserService.name);
  // private eagerRelations = serviceConfig.orgUser.eagerRelations;
  // private relations = serviceConfig.orgUser.relations;
  // private combinedRelations = _.union(this.relations, this.eagerRelations);

  constructor(
    @InjectRepository(OrgUser) private readonly repo: Repository<OrgUser>,
  ) { }

  async create(createOrgUserDto: CreateOrgUserDto) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createOrgUserDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const orgId = createOrgUserDto.orgId ?? createOrgUserDto.org!.id
    const userId = createOrgUserDto.userId ?? createOrgUserDto.user!.id

    const result = await this.repo.findOne({
      where: {
        orgId: orgId,
        userId: userId,
      },
    });
    if (result) {
      this.logger.error(`${fnName} : ${DUPLICATE_RECORD} : OrgUser with orgId : ${orgId} and userId : ${userId} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : OrgUser with orgId : ${orgId} and userId : ${userId} already exists`);
    }
    else {
      const orgUser = this.repo.create({
        userId: userId,
        orgId: orgId,
      });
      // const orgUser = this.repo.create(createOrgUserDto);
      this.logger.debug(`${fnName} : orgUser to be created is : ${JSON.stringify(orgUser)}`);
      return await this.repo.save(orgUser);
    }
  }

  findAll(searchCriteria: FindOrgUserDto, relationsRequired: boolean = false) {
    const fnName = this.findAll.name;
    const input = `Input : Find orgUser with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // const relations = relationsRequired
    //   ? this.combinedRelations
    //   : this.eagerRelations;

    return this.repo.find({
      where: searchCriteria,
      relations: ['user']// relations
    })
  }

  findOne(searchCriteria: FindOrgUserDto, relationsRequired: boolean = false) {
    const fnName = this.findOne.name;
    const input = `Input : Find OrgUser by searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // const relations = relationsRequired
    //   ? this.combinedRelations
    //   : this.eagerRelations;

    return this.repo.findOne({ where: searchCriteria, relations: []/* relations */ });
  }

  async update(findOrgUserDTO: FindOrgUserDto, updateOrgUserDto: UpdateOrgUserDto) {
    const fnName = this.update.name;
    const input = `Input : findOrgUserDTO : ${JSON.stringify(findOrgUserDTO)} and updateOrgUserDto : ${JSON.stringify(updateOrgUserDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateOrgUserDto.orgId == null) {
      this.logger.debug(`${fnName} : orgId not found in updateOrgUserDto`);
      updateOrgUserDto.orgId = findOrgUserDTO.orgId as string
    }
    if (updateOrgUserDto.userId == null) {
      this.logger.debug(`${fnName} : userId not found in updateOrgUserDto`);
      updateOrgUserDto.userId = findOrgUserDTO.userId as string
    }
    if (updateOrgUserDto.orgId != findOrgUserDTO.orgId) {
      this.logger.error(`${fnName} : orgId : ${findOrgUserDTO.orgId} and updateOrgUserDto object orgId : ${updateOrgUserDto.orgId} do not match`);
      throw new Error(`orgId : ${findOrgUserDTO.orgId} and updateOrgUserDto object orgId : ${updateOrgUserDto.orgId} do not match`);
    }
    if (updateOrgUserDto.userId != findOrgUserDTO.userId) {
      this.logger.error(`${fnName} : userId : ${findOrgUserDTO.userId} and updateOrgUserDto object userId : ${updateOrgUserDto.userId} do not match`);
      throw new Error(`orgId : ${findOrgUserDTO.userId} and updateOrgUserDto object userId : ${updateOrgUserDto.userId} do not match`);
    }
    const mergedOrgUser = await this.repo.preload(updateOrgUserDto);

    if (mergedOrgUser == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : OrgUser with orgId : ${findOrgUserDTO.orgId} and userId : ${findOrgUserDTO.userId} not found`);
      throw new Error(`${NO_RECORD} : OrgUser with orgId : ${findOrgUserDTO.orgId} and userId : ${findOrgUserDTO.userId} not found`);
    }
    else {
      this.logger.debug(`${fnName} : Merged OrgUser is : ${JSON.stringify(mergedOrgUser)}`);
      return await this.repo.save(mergedOrgUser);
    }
  }

  async delete(findOrgDTO: FindOrgUserDto) {
    const fnName = this.delete.name;
    const input = `Input : OrgUser to be deleted with : ${JSON.stringify(findOrgDTO)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete({
      orgId: findOrgDTO.orgId!,
      userId: findOrgDTO.userId!
    });

    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : OrgUser for : ${JSON.stringify(findOrgDTO)} not found`);
      throw new Error(`${NO_RECORD} : OrgUser for : ${JSON.stringify(findOrgDTO)} not found`);
    }
    else {
      this.logger.debug(`${fnName} : OrgUser for : ${JSON.stringify(findOrgDTO)} deleted successfully`);
      return result;
    }
  }

  async softDelete(findOrgUserDTO: FindOrgUserDto, orgUserToBeDeleted: OrgUser) {
    const fnName = this.softDelete.name;
    const input = `Input : OrgUser to be softDeleted where orgId : ${findOrgUserDTO.orgId} and userId : ${findOrgUserDTO.userId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    await this.repo.save(orgUserToBeDeleted);
    const result = await this.repo.softDelete({
      orgId: findOrgUserDTO.orgId!,
      userId: findOrgUserDTO.userId!
    });

    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : OrgUser for orgId : ${findOrgUserDTO.orgId} and userId : ${findOrgUserDTO.userId} not found`);
      throw new Error(`${NO_RECORD} : OrgUser for orgId : ${findOrgUserDTO.orgId} and userId : ${findOrgUserDTO.userId} not found`);
    }
    else {
      this.logger.debug(`${fnName} : OrgUser for orgId : ${findOrgUserDTO.orgId} and userId : ${findOrgUserDTO.userId} softDeleted successfully`);
      return result;
    }
  }

  async restore(findOrgUserDTO: FindOrgUserDto) {
    const fnName = this.restore.name;
    const input = `Input : OrgUser with orgId : ${findOrgUserDTO.orgId} and userId : ${findOrgUserDTO.userId} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.restore({
      orgId: findOrgUserDTO.orgId!,
      userId: findOrgUserDTO.userId!
    });

    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : OrgUser for orgId : ${findOrgUserDTO.orgId} and userId : ${findOrgUserDTO.userId} not found `);
      throw new Error(`${NO_RECORD} : OrgUser for orgId : ${findOrgUserDTO.orgId} and userId : ${findOrgUserDTO.userId} not found `);
    }
    else {
      this.logger.debug(`${fnName} : OrgUser for orgId : ${findOrgUserDTO.orgId} and userId : ${findOrgUserDTO.userId} restored successfully`);
      let restored = await this.findOne(findOrgUserDTO);
      // restored.deletedBy = null;
      // this.repo.save(restored);
      return restored;
    }
  }
}
