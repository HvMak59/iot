import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, TreeRepository } from 'typeorm';

// import {
//   findAll,
//   deleteRec,
//   softDelete,
//   restore,
// } from 'src/utils/cmnFn.repository';

import serviceConfig from 'src/app_config/service.config.json';

import { Org } from '../org/entities/org.entity';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { FindOrgDto } from './dto/find-org.dto';
import { FindOrgsOrAssets } from './dto/find-orgs-or-assets';
import { HttpService } from '@nestjs/axios';
import { KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import _ from 'lodash';

@Injectable()
export class OrgService {
  // private serviceName = serviceConfig.org.serviceName;
  private serviceName = [];
  private readonly logger = winstonServerLogger(OrgService.name);
  constructor(
    @InjectRepository(Org) private readonly repo: TreeRepository<Org>,
    private httpService: HttpService,
  ) { }

  async create(
    // createUserId: string, 
    createOrgDto: CreateOrgDto
  ) {
    /* let result;
    result = await this.repo.findOneBy({
      id: createOrgDto.id,
    });
    if (result) {
      throw new Error(
        `${DUPLICATE_RECORD} : ${createOrgDto.id} already exists`,
      );
      //response.status(HttpStatus.OK); //.json(org);
    } else {
      const org = this.repo.create(createOrgDto);
      result = await this.repo.save(org);
      this.logger.debug(`${JSON.stringify(result)} created`);
    }
    return result; */
    // createOrgDto.createdBy = createUserId;
    if (createOrgDto.parent == null && createOrgDto.parentId != null) {
      const parentOrg = await this.findOneById(createOrgDto.parentId);
      if (parentOrg) {
        createOrgDto.parent = parentOrg;
      }
    }
    const org = this.repo.create(createOrgDto);
    return await this.repo.save(org);
  }

  findAll(searchCriteria: FindOrgDto, relationsRequired: boolean = false) {
    const msgTemplate = 'Find ' + this.serviceName + 's';
    // let relations = relationsRequired ? serviceConfig.org.relations : [];
    // return findAll<Org>(this.repo, msgTemplate, relations, searchCriteria);
    return this.repo.find({
      where: searchCriteria,
      relations: ['orgUsers']
    });
  }

  findAllWithUsers(searchCriteria: FindOrgDto) {
    const msgTemplate = 'Find ' + this.serviceName + 's';
    let relations = ['users'];
    // return findAll<Org>(this.repo, msgTemplate, relations, searchCriteria);
  }

  /* findAllWthRelations() {
    const msgTemplate = 'Find ' + this.serviceName + 's' + ' with Relations';
    return findAll<Org>(this.repo, msgTemplate, serviceConfig.org.relations);
  } */

  findOneById(id: string) {
    //return findOne<Org>(this.repo, id, msgTemplate, "org");
    return this.repo.findOne({ where: { id: id } });
  }

  findOneWithUsers(findOrgDTO: FindOrgDto) {
    const searchObj: FindOptionsWhere<Org> = {};
    findOrgDTO.id != null ? (searchObj.id = findOrgDTO.id) : null;
    findOrgDTO.hierId != null ? (searchObj.hierId = findOrgDTO.hierId) : null;

    return this.repo.findOne({
      where: findOrgDTO,
      relations: ['users'],
    });
  }

  async findOneByIdWthRelations(id: string) {
    const msgTemplate = 'Find ' + this.serviceName + ' with Relations';
    //return findOne(this.repo, id, msgTemplate, "org", "user");
    try {
      return await this.repo.findOne({
        where: {
          id: id,
        },
        // relations: serviceConfig.org.relations,
      });
    } catch (error) {
      this.logger.error(`${msgTemplate} : ${id} : ${error}`);
      throw new Error(error as string);
    }
  }

  async getParentHierarchy(
    orgId: string,
  ) {

    const hierarchy: string[] = [];

    let currentOrgId: string | undefined = orgId;

    while (currentOrgId) {

      hierarchy.push(currentOrgId);

      const org = await this.repo.findOne({
        select: {
          id: true,
          parentId: true,
        },
        where: {
          id: currentOrgId,
        },
      });

      if (!org) {
        break;
      }

      currentOrgId = org.parentId;
    }

    return hierarchy;
  }

  // async getChildrenHierarchy(
  //   orgId: string,
  // ) {

  //   const org = await this.repo.findOne({
  //     where: { id: orgId },
  //   });

  //   if (!org) {
  //     return [];
  //   }

  //   const descendants = await this.repo.findDescendants(org);

  //   return descendants.map(org => org.id);
  // }

  async getChildrenHierarchy(orgId: string) {

    const org = await this.repo.findOne({
      select: {
        id: true
      },
      where: { id: orgId },
    });

    if (!org) {
      this.logger.error(`OrgId ${orgId} not found`);
      return [];
    }

    const descendants = await this.repo.findDescendants(org);

    const descendantOrgs = [org, ...descendants];

    return descendantOrgs.map(o => o.id);
  }




  async setParent(childOrgId: string, parentOrgId: string) {
    const msgTemplate =
      this.serviceName +
      ' : Add parent org : ' +
      parentOrgId +
      ' to child org : ' +
      childOrgId;
    try {
      this.logger.debug(msgTemplate);
      const childOrg = await this.findOneByIdWthRelations(childOrgId);
      if (childOrg) {
        //this.logger.debug(`${msgTemplate} : parent id ${childOrg.parent.id} found`);
        if (childOrg.parent) {
          this.logger.debug(
            `${msgTemplate} : child org : ${childOrgId} already has parent : ${childOrg.parent.id}`,
          );
          return false;
        } else {
          const parentOrg = await this.findOneById(parentOrgId);
          if (parentOrg) {
            childOrg.parent = parentOrg;
            const result = await this.repo.save(childOrg);
            //const result = await this.update(childOrgId, childOrg);
            return true;
          } else {
            const errMsg = `${msgTemplate} : parent org ${parentOrgId} does not exist`;
            this.logger.error(errMsg);
            throw new Error(errMsg);
          }
        }
      } else {
        const errMsg = `${msgTemplate} : child org ${childOrgId} does not exist`;
        this.logger.error(errMsg);
        throw new Error(errMsg);
      }
    } catch (error) {
      let errMsg: string;
      error instanceof Error
        ? (errMsg = error.message)
        : (errMsg = String(error));
      this.logger.error(errMsg);
      throw new Error(errMsg);
    }
  }

  async removeParent(childOrgId: string) {
    const msgTemplate =
      this.serviceName + ' : Remove parent org  for : ' + childOrgId;
    try {
      this.logger.debug(msgTemplate);
      const childOrg = await this.findOneByIdWthRelations(childOrgId);
      if (childOrg) {
        return await this.repo
          .createQueryBuilder()
          .relation('parent')
          .of(childOrg)
          .set(null);
      } else {
        const errMsg = `${msgTemplate} : child org ${childOrgId} does not exist`;
        this.logger.error(errMsg);
        throw new Error(errMsg);
      }
    } catch (error) {
      let errMsg: string;
      error instanceof Error
        ? (errMsg = error.message)
        : (errMsg = String(error));
      this.logger.error(errMsg);
      throw new Error(errMsg);
    }
  }

  async findDescendentsTree(orgID: string, withAssets: boolean = false) {
    let orgDescedentsTree;
    const relations = withAssets ? ['assets', 'parent'] : ['parent'];

    const org: Org = await this.repo.findOneByOrFail({ id: orgID });
    orgDescedentsTree = await this.repo.findDescendantsTree(org, {
      relations: relations,
    });
    return orgDescedentsTree;
  }

  async findDescendents(
    findOrgsOrAssets: FindOrgsOrAssets,
    withAssets = false,
  ) {
    /*  const org = await this.repo.findOneByOrFail(findOrgDTO);
    return await this.repo.findDescendants(org, {
      relations: withAssets ? ['assets'] : [],
    }); */
    //try {
    console.log("in findesc");
    const fnName = 'findDescendents()';
    const input = `Input : ${JSON.stringify(findOrgsOrAssets)}`;
    this.logger.debug(`${fnName} ${KEY_SEPARATOR} Start`);
    this.logger.debug(`${fnName} ${KEY_SEPARATOR} ${input}`);
    const mapOfDescedentOrgs: Map<string, Org> = new Map();
    const orgs = await this.findAll(
      this.getFindOrgDTOFromMultipleIDs(findOrgsOrAssets),
    );
    // console.log('orgs', orgs);
    for (const org of orgs) {
      let orgDescedents: Array<Org>;
      // this.logger.debug(`${fnName} : Finding descedent orgs for ${org.id}`);
      orgDescedents = await this.repo.findDescendants(org, {
        relations: withAssets ? ['assets', 'parent'] : ['parent'],
      });
      // this.logger.debug(
      // `${fnName} : Found ${orgDescedents.length} descedent orgs for ${org.id}`,
      // );
      // console.log(orgDescedents)
      orgDescedents.forEach((orgDescedent) => {
        mapOfDescedentOrgs.set(orgDescedent.id, orgDescedent);
      });
    }
    const response = Array.from(mapOfDescedentOrgs.values());
    /* this.logger.debug(
      `${fnName} Org final response : ${JSON.stringify(response)}`,
    ); */
    return response;
  }

  async findAscendents(findOrgDTO: FindOrgDto, withAssets: boolean = false) {
    const fnName = 'findAscendents()';
    const input = `Input : ${JSON.stringify(findOrgDTO)}`;
    this.logger.debug(`${fnName} ${KEY_SEPARATOR} Start`);
    this.logger.debug(`${fnName} ${KEY_SEPARATOR} ${input}`);
    let orgAscedents: Org;
    /* const orgs = await this.findAll(
      this.getFindOrgDTOFromMultipleIDs(findOrgDTO),
    ); */
    //for (const org of orgs) {
    this.logger.debug(
      `${fnName} : Finding Ascedents orgs for ${findOrgDTO.id}`,
    );
    const org = await this.repo.findOneByOrFail(findOrgDTO);
    if (withAssets) {
      orgAscedents = await this.repo.findAncestorsTree(org, {
        relations: ['assets', 'parent'],
      });
    } else {
      orgAscedents = await this.repo.findAncestorsTree(org, {
        relations: ['parent'],
      });
    }
    //this.logger.debug(`${msgTemplate} : Found descedent orgs for ${org.id}`);
    /* orgDescedents.forEach((orgDescedent) => {
              mapOfDescedentOrgs.set(orgDescedent.id, orgDescedent);
            }); */
    return orgAscedents;
    //}
    //return Array.from(mapOfDescedentOrgs.values());
  }

  /* async findDescendents(csvIds: string, withAssets: boolean = false) {
    const msgTemplate =
      'Find ' + this.serviceName + ' Descendents : csvIds : ' + csvIds;
    try {
      this.logger.debug(msgTemplate);
      const orgs = await this.findAll({ id: csvIds });
      this.logger.debug(`${msgTemplate} : Parent Org : ${JSON.stringify([...orgs])}`);
      if (orgs[0]) {
        let orgDescendents;
        if (withAssets) {
          orgDescendents = await this.repo.findDescendants(orgs[0], {
            relations: ['assets'],
          });
        } else {
          orgDescendents = await this.repo.findDescendants(orgs[0]);
        }
        this.logger.debug(
          `${msgTemplate} : Response : ${JSON.stringify([...orgDescendents])}`,
        );
        return orgDescendents;
      } else {
        const errMsg = msgTemplate + 'not available';
        throw new Error(errMsg);
      }
    } catch (error) {
      let errMsg: string;
      error instanceof Error
        ? (errMsg = error.message)
        : (errMsg = String(error));
      this.logger.error(errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } */

  async update(id: string, updateOrgDto: UpdateOrgDto) {
    const fnName = this.update.name;
    const input = `Input : Org Id : ${id}, Update Org Id : ${updateOrgDto.id?.toString()} Update Object : ${JSON.stringify(
      updateOrgDto,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    if (updateOrgDto.id == null) {
      this.logger.debug(`${fnName} : Org Id not found in updateOrgDto`);
      updateOrgDto.id = id;
    } else if (updateOrgDto.id !== id) {
      throw new Error('Org Id and Update Org Object Id do not match');
    }
    const updatedOrg = await this.repo.preload(updateOrgDto);
    if (updatedOrg == null) {
      throw new Error(`${NO_RECORD} : Org id : ${updateOrgDto.id} not found`);
    } else {
      /* this.logger.debug(
        `${fnName} : Updated org is : ${JSON.stringify(updatedOrg)}`,
      ); */
      const savedOrg = await this.repo.save(updatedOrg);
      /* this.logger.debug(
        `${fnName} : Saved org is : ${JSON.stringify(savedOrg)}`,
      ); */
      return savedOrg;
    }
  }

  delete(id: string) {
    const msgTemplate = 'Delete ' + this.serviceName;
    // return deleteRec<Org>(this.repo, id, msgTemplate);
    /* try {
      const org = await this.repo.delete(id);
      if (org.affected === 0) {
        this.logger.debug(`Delete Org : ${id} not found`);
      }
      else 
        this.logger.debug(`Delete Org : ${id} deleted`);
      return org;
    } catch (error) {
      this.logger.error(`Delete Org : ${id} : ${error}`);
      throw new Error(error as string);
    } */
  }

  async softDelete(id: string) {
    const msgTemplate = 'Soft delete ' + this.serviceName;
    // return softDelete<Org>(this.repo, id, msgTemplate);
    /* try {
      const org = await this.repo.softDelete(id);
      if (org.affected === 0) {
        this.logger.debug(`Soft delete Org : ${id} not found`);
      }
      else 
        this.logger.debug(`Soft delete Org : ${id} soft deleted`);
      return org;
    } catch (error) {
      this.logger.error(`Soft delete Org : ${id} : ${error}`);
      throw new Error(error as string);
    } */
  }

  restore(id: string) {
    const msgTemplate = 'Restore ' + this.serviceName;
    // return restore<Org>(this.repo, id, msgTemplate);
    /* try {
      const org = await this.repo.restore(id);
      if (org.affected === 0) {
        this.logger.debug(`Restore Org : ${id} not found`);
      }
      else 
        this.logger.debug(`Restore Org : ${id} restored`);
      return org;
    } catch (error) {
      this.logger.error(`Restore Org : ${id} : ${error}`);
      throw new Error(error as string);
    } */
  }

  getFindOrgDTOFromMultipleIDs(searchCriteria: FindOrgsOrAssets) {
    const findOrgDTO: FindOrgDto = {};
    if (searchCriteria.csvOrgIDs && searchCriteria.csvOrgIDs.length > 0) {
      findOrgDTO.id = In(searchCriteria.csvOrgIDs.split(','));
    }
    if (
      searchCriteria.csvOrgHierIDs &&
      searchCriteria.csvOrgHierIDs.length > 0
    ) {
      findOrgDTO.hierId = In(searchCriteria.csvOrgHierIDs.split(','));
    }
    return findOrgDTO;
  }

  findAncestorsWith_OutgoingURLs(org: Org) {
    return this.repo.findAncestors(org, {
      relations: ['outgoingUrls'],
    });
  }
  /* async findAllOutgoingURLsForAncestors(findOrgsOrAssets: FindOrgsOrAssets) {
    const fnName = this.findAllOutgoingURLsForAncestors.name;
    const orgs = await this.findAll(
      this.getFindOrgDTOFromMultipleIDs(findOrgsOrAssets),
    );
    this.logger.debug(
      `${fnName} : Found ${orgs.length} orgs for ${JSON.stringify(
        findOrgsOrAssets,
      )}`,
    );
    const orgsWithOutgoingURLs = [];
    for (const org of orgs) {
      const outgoingURLS = [];
      this.logger.debug(`${fnName} : org is ${org.id}, ${org.hierId}`);
      const orgAncestors = await this.findAncestorsWith_OutgoingURLs(org);
      this.logger.debug(
        `${fnName} : Found ${orgAncestors.length} ancestors for ${org.id}`,
      );
      for (const ancestor of orgAncestors) {
        this.logger.debug(
          `${fnName} : ancestor is ${ancestor.id}, ${ancestor.hierId}`,
        );
        this.logger.debug(
          `${fnName} : ancestor outgoing urls are ${ancestor.outgoingUrls?.length}`,
        );
        if (ancestor.outgoingUrls && ancestor.outgoingUrls.length > 0) {
          outgoingURLS.push(...ancestor.outgoingUrls);
        }
      }
      org.outgoingUrls = outgoingURLS;
      this.logger.debug(
        `${fnName} : org outgoing urls are ${org.outgoingUrls?.length}`,
      );
      const orgWithURLs = new Org(org);
      orgsWithOutgoingURLs.push(orgWithURLs);
    }
    return orgsWithOutgoingURLs;
  } */

  // async findAllOutgoingURLsForAncestors(orgs: Org[]) {
  //   const fnName = this.findAllOutgoingURLsForAncestors.name;
  //   this.logger.debug(`${fnName} : Found ${orgs.length} orgs`);
  //   const orgsWithOutgoingURLs = [];
  //   for (const org of orgs) {
  //     const outgoingURLS = [];
  //     this.logger.debug(`${fnName} : Processing org`);
  //     this.logger.debug(`${fnName} : org is ${org.id}, ${org.hierId}`);
  //     const orgAncestors = await this.findAncestorsWith_OutgoingURLs(org);
  //     this.logger.debug(
  //       `${fnName} : orgAncestors ${JSON.stringify([...orgAncestors])}`,
  //     );
  //     this.logger.debug(
  //       `${fnName} : Found ${orgAncestors.length} ancestors for ${org.id}`,
  //     );
  //     for (const ancestor of orgAncestors) {
  //       this.logger.debug(
  //         `${fnName} : ancestor is ${ancestor.id}, ${ancestor.hierId}`,
  //       );
  //       this.logger.debug(
  //         `${fnName} : ancestor outgoing urls are ${ancestor.outgoingUrls?.length}`,
  //       );
  //       if (ancestor.outgoingUrls && ancestor.outgoingUrls.length > 0) {
  //         outgoingURLS.push(...ancestor.outgoingUrls);
  //       }
  //     }
  //     org.outgoingUrls = outgoingURLS;
  //     this.logger.debug(
  //       `${fnName} : org outgoing urls are ${org.outgoingUrls?.length}`,
  //     );
  //     const orgWithURLs = new Org(org);
  //     orgsWithOutgoingURLs.push(orgWithURLs);
  //   }
  //   return orgsWithOutgoingURLs;
  // }
}
