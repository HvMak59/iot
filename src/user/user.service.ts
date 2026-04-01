import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';

// import { findAll, deleteRec, restore } from '../../utils/cmnFn.repository';

// import serviceConfig from '../../app_config/service.config.json';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../user/entities/user.entity';
import { FindUserDto } from './dto/find-user.dto';
import { FindUsersByMultipleIDs } from './dto/find-user-by-multipleIDs.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { HttpService } from '@nestjs/axios';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_OF_SALTS, ORG_USER_URL } from 'src/app_config/constants';
import { getTokenString } from 'src/utils/others';
import { firstValueFrom } from 'rxjs';
// import {
//   getTokenString,
//   getTryCatchErrorStr,
//   throwErrIfSrvcRespFailure,
// } from 'utils/others';
// import {
//   CURRENT_PASSWORD_DOES_NOT_MATCH,
//   DUPLICATE_RECORD,
//   KEY_SEPARATOR,
//   NOT_FOUND,
//   NO_OF_SALTS,
//   NO_RECORD,
//   ORG_USER_URL,
//   USER_DOES_NOT_EXIST,
//   USER_ROLE_UPDATE_FROM_USER_URL,
//   USER_ROLE_URL,
// } from 'src/app_config/constants';
// import * as bcrypt from 'bcrypt';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { HttpService } from '@nestjs/axios';
// import { UserWithRelatedOrgs } from 'src/iot-server/dto/user-relatedOrgs.dto';
// import { Org } from 'src/org/entities/org.entity';
// import { RelatedOrg } from 'src/iot-server/dto/related-org.dto';
// import _ from 'lodash';
// import { OrgService } from 'src/org/org.service';
// import { firstValueFrom } from 'rxjs';
// import { FindOrgDto } from 'src/org/dto/find-org.dto';
// import { OrgType } from 'utils/enums';
// import { UserRole } from 'src/user-role/entities/user-role.entity';
// import { OrgUser } from 'src/org-user/entities/org-user.entity';

@Injectable()
// export class UserService {
//   //private serviceName = serviceConfig.user.serviceName;
//   private schema;
//   private appServer;
//   private appPort;
//   private baseURL;
//   private reqdRelations = serviceConfig.user.relations;
//   private readonly logger = winstonServerLogger(UserService.name);
//   //private noOfSalts = 10;
//   constructor(
//     @InjectRepository(User) private readonly repo: Repository<User>,
//     private readonly httpService: HttpService,
//     // private readonly orgService: OrgService,
//   ) {
//     this.schema = process.env['SCHEMA'];
//     this.appServer = process.env['APP_SERVER'];
//     this.appPort = process.env['APP_PORT'];
//     this.baseURL = `${this.schema}://${this.appServer}:${this.appPort}`;
//   }

//   // async create(token: string, createUserDto: CreateUserDto) {
//   //   const fnName = 'create()';
//   //   const input = `Input : ${JSON.stringify(createUserDto)}`;
//   //   //try {
//   //   this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//   //   this.logger.debug(fnName + KEY_SEPARATOR + input);
//   //   let user;
//   //   if (createUserDto.password != null) {
//   //     createUserDto.password = await bcrypt.hash(
//   //       createUserDto.password,
//   //       NO_OF_SALTS,
//   //     );
//   //   }
//   //   const { userOrgs, ...createUserWithoutOrgs } = createUserDto;
//   //   const { userRoles, ...createUserWithoutOrgsAndRoles } =
//   //     createUserWithoutOrgs;
//   //   user = await this.repo.findOneBy({
//   //     id: createUserDto.id,
//   //   });
//   //   if (user) {
//   //     throw new Error(`${DUPLICATE_RECORD} for User Id : ${createUserDto.id}`);
//   //     //response.status(HttpStatus.OK); //.json(org);
//   //   } else {
//   //     const createUserObj = this.repo.create(createUserWithoutOrgsAndRoles);
//   //     const createdUser = await this.repo.save(createUserObj);
//   //     if (userOrgs == null || userOrgs.length == 0) {
//   //       throw new Error(
//   //         `User ${createUserDto.id} is not associated with any orgs`,
//   //       );
//   //     } else {
//   //       //const { userOrgs, ...createUserWithoutOrgs } = createUserDto;
//   //       const createUserOrgURL = new URL(ORG_USER_URL, this.baseURL);
//   //       this.logger.debug(
//   //         `${fnName} : createUserOrgURL : ${createUserOrgURL.href}`,
//   //       );
//   //       this.httpService.axiosRef.defaults.headers.common['Authorization'] =
//   //         getTokenString(token);
//   //       const createdUserOrgs: OrgUser[] = [];
//   //       for (const userOrg of userOrgs) {
//   //         const userOrgURLResp = await firstValueFrom(
//   //           this.httpService.post<OrgUser>(createUserOrgURL.href, userOrg),
//   //         );
//   //         throwErrIfSrvcRespFailure(userOrgURLResp);
//   //         createdUserOrgs.push(userOrgURLResp.data);
//   //       }
//   //       createdUser.userOrgs = createdUserOrgs;
//   //     }
//   //     if (userRoles == null || userRoles.length == 0) {
//   //       this.logger.debug(`No roles assigned to user ${createdUser.id}`);
//   //     } else {
//   //       /* const { userRoles, ...createUserWithoutRoles } = createUserWithoutOrgs;
//   //       const createUserObj = this.repo.create(createUserWithoutRoles);
//   //       const createdUser = await this.repo.save(createUserObj); */

//   //       const createUserRoleURL = new URL(USER_ROLE_URL, this.baseURL);

//   //       this.logger.debug(
//   //         `${fnName} : userRoleURL : ${createUserRoleURL.href}`,
//   //       );

//   //       this.httpService.axiosRef.defaults.headers.common['Authorization'] =
//   //         getTokenString(token);
//   //       const createdUserRoles: UserRole[] = [];

//   //       for (const userRole of userRoles) {
//   //         userRole.userId = createdUser.id;
//   //         this.logger.debug(`UserRole : ${JSON.stringify(userRole)}`);

//   //         const userRoleURLResp = await firstValueFrom(
//   //           this.httpService.post<UserRole>(createUserRoleURL.href, userRole),
//   //         );
//   //         throwErrIfSrvcRespFailure(userRoleURLResp);
//   //         createdUserRoles.push(userRoleURLResp.data);
//   //       }
//   //       createdUser.userRoles = createdUserRoles;
//   //     }
//   //     return createdUser;
//   //   }

//   //   /* } catch (error) {
//   //     const errMsg = getTryCatchErrorStr(error);
//   //     this.logger.error(fnName + KEY_SEPARATOR + errMsg);
//   //     throw new Error(errMsg);
//   //   } */
//   // }

//   findAll(searchCriteria: FindUserDto, relationsRequired: boolean = false) {
//     const fnName = 'findAll()';
//     const relations = relationsRequired ? serviceConfig.user.relations : [];
//     return findAll<User>(
//       this.repo,
//       UserService.name + KEY_SEPARATOR + fnName,
//       relations,
//       searchCriteria,
//     );
//   }

//   findOne(searchUser: FindUserDto, relationsRequired = false) {
//     const relations = relationsRequired ? serviceConfig.user.relations : [];
//     return this.repo.findOne({ where: searchUser, relations: relations });
//   }

//   findOneWithPassword(searchUser: FindUserDto) {
//     return this.repo
//       .createQueryBuilder('user')
//       .where(searchUser)
//       .select('user.id')
//       .addSelect('user.password')
//       .getOne();
//   }

//   async validatePassword(id: string, password: string) {
//     const user = await this.findOneWithPassword({ id: id });
//     if (user) {
//       const hasPasswordMatched = await bcrypt.compare(password, user.password);
//       if (hasPasswordMatched) {
//         return true;
//       } else {
//         throw new Error(USER_DOES_NOT_EXIST);
//       }
//     } else {
//       throw new Error(USER_DOES_NOT_EXIST);
//     }
//   }
//   async changePassword(
//     id: string,
//     currentPassword: string,
//     newPassword: string,
//   ) {
//     const user = await this.findOneWithPassword({ id: id });
//     if (user) {
//       const hasPasswordMatched = await bcrypt.compare(
//         currentPassword,
//         user.password,
//       );
//       if (hasPasswordMatched) {
//         this.logger.debug('Password matched');
//         return await this.update(id, {
//           password: newPassword, //await bcrypt.hash(newPassword, NO_OF_SALTS),
//         });
//       } else {
//         throw new Error(CURRENT_PASSWORD_DOES_NOT_MATCH);
//       }
//     } else {
//       throw new Error(USER_DOES_NOT_EXIST);
//     }
//   }

//   async findOneByIdOrFail(
//     id: string,
//     relationsRequired = false,
//     secret = false,
//   ) {
//     const relations = relationsRequired ? this.reqdRelations : [];
//     return this.repo.findOne({
//       where: { id: id },
//       relations: {
//         userOrgs: {
//           org: true,
//         },
//       },
//     });
//   }

//   async findUsersByMultipleIDs(findUsersByMultipleIDs: FindUsersByMultipleIDs) {
//     let searchCriteria: FindOptionsWhere<User>;
//     if (findUsersByMultipleIDs.csvOrgIDs) {
//       const orgIDs: Array<string> = findUsersByMultipleIDs.csvOrgIDs.split(',');
//       searchCriteria = {
//         userOrgs: {
//           orgId: In(orgIDs),
//         },
//       };
//     } else {
//       throw new Error('No criteria specified to identify users');
//     }
//     return this.repo.find({
//       where: searchCriteria,
//       relations: {
//         userOrgs: {
//           org: true,
//         },
//       },
//     });
//   }

//   async update(id: string, updateUserDto: UpdateUserDto, token?: string) {
//     const fnName = 'update()';
//     const input = `Input : user id : ${id}, Update : ${JSON.stringify(
//       updateUserDto,
//     )}`;
//     this.logger.debug(`${fnName} : ${input}`);
//     if (updateUserDto.id == null) {
//       this.logger.debug(`${fnName} : updateUserDto.id is null`);
//       updateUserDto.id = id;
//     } else if (updateUserDto.id != id) {
//       throw new Error('User Id and update User object Id do not match');
//     } //else {
//     if (updateUserDto.password != null) {
//       updateUserDto.password = await bcrypt.hash(
//         updateUserDto.password,
//         NO_OF_SALTS,
//       );
//     }
//     const mergedUser = await this.repo.preload(updateUserDto);
//     this.logger.debug(`mergedUser : ${JSON.stringify(mergedUser)}`);
//     if (mergedUser == null) {
//       throw new Error(`${NO_RECORD} : User id : ${id} does not exist`);
//     }
//     //mergedUser.userRoles = updateUserDto.userRoles;
//     /* if (updateUserDto.password != null) {
//         mergedUser.password = updateUserDto.password;
//       } */
//     let userToBeSaved: User = mergedUser;
//     if (mergedUser.userRoles != null && mergedUser.userRoles.length > 0) {
//       this.logger.debug(`${fnName} : User to be saved with roles`);
//       const { userRoles, ...mergedUserWithoutRoles } = mergedUser;
//       userToBeSaved = this.repo.create(mergedUserWithoutRoles);
//       const result = await this.repo.save(userToBeSaved);
//       if (result === null) {
//         throw new Error(`${NO_RECORD} : User id : ${id} does not exist`);
//       }
//       const updateUserRoleURL = new URL(
//         USER_ROLE_UPDATE_FROM_USER_URL,
//         this.baseURL,
//       );

//       updateUserRoleURL.searchParams.append('userId', id);
//       this.logger.debug(`updateUserRoleURL : ${updateUserRoleURL.href}`);
//       if (token) {
//         this.httpService.axiosRef.defaults.headers.common['Authorization'] =
//           getTokenString(token);
//       } else {
//         throw new Error(`${fnName} : No token found`);
//       }
//       const updateUserRoleURLResp = await firstValueFrom(
//         this.httpService.patch<UserRole[]>(updateUserRoleURL.href, userRoles),
//       );
//       throwErrIfSrvcRespFailure(updateUserRoleURLResp);
//       return updateUserDto;
//     } else {
//       this.logger.debug(`${fnName} : User to be saved without roles`);
//       const user = await this.repo.save(userToBeSaved);
//       this.logger.debug(`Saved user : ${JSON.stringify(user)}`);
//       return user;
//     }
//     //}
//   }

//   delete(id: string) {
//     const fnName = 'delete()';
//     return deleteRec<User>(
//       this.repo,
//       id,
//       UserService.name + KEY_SEPARATOR + fnName,
//     );
//   }

//   async softDelete(id: string, userId: string) {
//     const fnName = 'softDelete()';
//     const result = await this.findOneByIdOrFail(id);
//     if (result != null) {
//       result.deletedBy = userId;
//       const user = await this.repo.save(result);
//       return await this.repo.softDelete(user.id);
//     }
//   }

//   restore(id: string) {
//     const fnName = 'restore()';
//     return restore<User>(
//       this.repo,
//       id,
//       UserService.name + KEY_SEPARATOR + fnName,
//     );
//   }

//   /* Serving only one ascendent Org as of now */
//   async userOrgs(id: string) {
//     const fnName = 'userOrgs()';
//     const input = `Input : ${id}`;
//     try {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//       this.logger.debug(fnName + KEY_SEPARATOR + input);

//       const relationsRequired = true;
//       const user = await this.findOneByIdOrFail(id, relationsRequired);
//       this.logger.debug(
//         `${fnName} : User response is : ${JSON.stringify(user)}`,
//       );
//       if (user) {
//         const userWithRelatedOrgs = new UserWithRelatedOrgs(user);
//         if (!_.isNil(user.userOrgs)) {
//           for (const associatedOrg of user.userOrgs) {
//             const findOrgDTO: FindOrgDto = {
//               id: associatedOrg.orgId,
//             };
//             const ascendentsOrgs = await this.orgService.findAscendents(
//               findOrgDTO,
//             );
//             this.logger.debug(
//               `${fnName} : Ascendent orgs : ${JSON.stringify(ascendentsOrgs)}`,
//             );
//             /* const ascendentsOrgsURL = new URL(
//               ASCEDENTS_ORGS_WITHOUT_ASSETS_URL,
//               this.baseURL,
//             );
//             ascendentsOrgsURL.searchParams.append(
//               'csvOrgIDs',
//               associatedOrg.orgId,
//             );
//             this.logger.debug(
//               `${fnName} : Ascendants Org URL : ${ascendentsOrgsURL.href}`,
//             );
//             const ascendentsOrgsResp = await firstValueFrom(
//               this.httpService.get<Org>(ascendentsOrgsURL.href),
//             );
//             throwErrIfSrvcRespFailure(ascendentsOrgsResp); */
//             userWithRelatedOrgs.relatedOrgs =
//               this.getRelatedOrgs(ascendentsOrgs);
//             /* ascendentsOrgs
//               ? userWithRelatedOrgs.relatedOrgs.push(
//                   this.getRelatedOrgs(ascendentsOrgs),
//                 )
//               : null; */
//             this.logger.debug(
//               `${fnName} : ${userWithRelatedOrgs.id} authentication successful`,
//             );
//           }
//         } else {
//           user.userOrgs = [];
//         }
//         this.logger.debug(
//           `${fnName} : response : ${JSON.stringify(userWithRelatedOrgs)}`,
//         );
//         return userWithRelatedOrgs;
//       } else {
//         const errMsg = `${NOT_FOUND} ${id}`;
//         throw new Error(errMsg);
//       }
//     } catch (error) {
//       const errMsg = getTryCatchErrorStr(error);
//       this.logger.error(`${fnName} : ${errMsg}`);
//       throw new Error(errMsg);
//     }
//   }

//   getRelatedOrgs(ascendentsOrgs: Org /* , associatedOrg: Org */) {
//     const fnName = 'getRelatedOrgs()';
//     const orgTypeMap = new Map<OrgType, RelatedOrg>();
//     //const relatedAssociatedOrg = new RelatedOrg(associatedOrg, 'AS');
//     const { parent, ...attachedOrg } = ascendentsOrgs;
//     const attachedOrgObj = new RelatedOrg(attachedOrg, OrgType.AssociatedOrg);
//     orgTypeMap.set(OrgType.AssociatedOrg, attachedOrgObj);
//     let processedOrg = ascendentsOrgs;
//     do {
//       const { parent, ...ascendentOrgWithoutParent } = processedOrg;
//       const ascendentOrgWithoutParentObj = new RelatedOrg(
//         ascendentOrgWithoutParent,
//       );
//       orgTypeMap.set(
//         ascendentOrgWithoutParentObj.type,
//         ascendentOrgWithoutParentObj,
//       );
//       processedOrg = processedOrg.parent;
//     } while (processedOrg);
//     return Array.from(orgTypeMap.values());
//     //userWithRelatedOrgs.relatedOrgs.push(Array.from(orgTypeMap.values()));
//   }
// }

export class UserService { }