import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { FindUsersByMultipleIDs } from './dto/find-user-by-multipleIDs.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import {
  CURRENT_PASSWORD_DOES_NOT_MATCH,
  KEY_SEPARATOR,
  NOT_FOUND,
  USER_DOES_NOT_EXIST,
  USER_NOT_IN_REQUEST_HEADER,
} from 'src/app_config/constants';
import { getTryCatchErrorStr } from 'src/utils/others';

// import { Token } from 'src/utils/token.decorator';
// import { UserId } from 'src/utils/req-user-id.decorator';

@Controller('user')
// export class UserController {
//   private readonly logger = winstonServerLogger(UserController.name);
//   constructor(private readonly userService: UserService) {}

//   @Post()
//   async create(
//     @Token() token: string,
//     @UserId() userId: string,
//     @Body() createUserDto: CreateUserDto,
//     //@Res({ passthrough: true }) response: Response,
//   ) {
//     const fnName = 'create()';
//     const input = `Input : ${JSON.stringify(createUserDto)}`;
//     //try {
//     this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//     this.logger.debug(fnName + KEY_SEPARATOR + input);
//     //const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
//     //const userId = getUserIdFromReq(req);
//     /* this.logger.debug(`token : ${token}`);
//       const decodedToken = Buffer.from(token!, 'base64');
//       this.logger.debug(`decoded token : ${decodedToken}`);
//       this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//       this.logger.debug('User : ' + JSON.stringify(req.user)); */
//     if (token != null && userId != null) {
//       createUserDto.createdBy = userId;
//       return await this.userService.create(token, createUserDto);
//     } else {
//       throw new Error(USER_NOT_IN_REQUEST_HEADER);
//     }
//     /* } catch (error) {
//       const errMsg = getTryCatchErrorStr(error);
//       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
//       throw new HttpException(
//         errMsg,
//         errMsg.startsWith(DUPLICATE_RECORD)
//           ? HttpStatus.CONFLICT
//           : HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     } finally {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'End');
//     } */
//   }

//   @Get()
//   async findAll(@Query() searchCriteria: FindUserDto) {
//     const fnName = 'findAll()';
//     const input = `Input : ${JSON.stringify(searchCriteria)}`;
//     try {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//       this.logger.debug(fnName + KEY_SEPARATOR + input);
//       return await this.userService.findAll(searchCriteria);
//     } catch (error) {
//       const errMsg = getTryCatchErrorStr(error);
//       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
//       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
//     } finally {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'End');
//     }
//   }

//   @Get('relations')
//   async findAllWthRelations(@Query() searchCriteria: FindUserDto) {
//     const relationsRequired = true;
//     const fnName = 'findAllWthRelations()';
//     const input = `Input : ${JSON.stringify(searchCriteria)}`;
//     try {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//       this.logger.debug(fnName + KEY_SEPARATOR + input);
//       return await this.userService.findAll(searchCriteria, relationsRequired);
//     } catch (error) {
//       const errMsg = getTryCatchErrorStr(error);
//       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
//       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
//     } finally {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'End');
//     }
//   }

//   @Get('findByIdOrFail')
//   async findOneOrFail(@Query('id') id: string) {
//     const fnName = 'findOneOrFail()';
//     const input = `Input : ${id}`;
//     try {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//       this.logger.debug(fnName + KEY_SEPARATOR + input);
//       return await this.userService.findOneByIdOrFail(id);
//     } catch (error) {
//       const errMsg = getTryCatchErrorStr(error);
//       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
//       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
//     } finally {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'End');
//     }
//   }

//   @Get('findByIdOrFail/relations')
//   async findOneOrFailWithRelations(@Query('id') id: string) {
//     //console.log(`landed at the right place : id ${id}`);
//     const fnName = 'findOneOrFailWithRelations()';
//     const input = `Input : ${id}`;
//     try {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//       this.logger.debug(fnName + KEY_SEPARATOR + input);
//       const relationsRequired = true;
//       return await this.userService.findOneByIdOrFail(id, relationsRequired);
//     } catch (error) {
//       const errMsg = getTryCatchErrorStr(error);
//       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
//       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
//     } finally {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'End');
//     }
//   }

//   @Get('userOrgs')
//   async userOrgs(@Query('id') id: string) {
//     const fnName = 'userOrgs()';
//     const input = `Input : ${id}`;
//     try {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//       this.logger.debug(fnName + KEY_SEPARATOR + input);
//       return await this.userService.userOrgs(id);
//     } catch (error) {
//       const errMsg = getTryCatchErrorStr(error);
//       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
//       throw new HttpException(
//         errMsg,
//         errMsg.includes(NOT_FOUND)
//           ? HttpStatus.UNAUTHORIZED
//           : HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     } finally {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'End');
//     }
//   }

//   @Get('multipleIDs')
//   findByMultipleIDs(@Query() findUserByMultipleIDs: FindUsersByMultipleIDs) {
//     return this.userService.findUsersByMultipleIDs(findUserByMultipleIDs);
//   }
//   /* @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.userService.findOneById(id);
//   }

//   @Get('relations/:id')
//   findOneWithOrgs(@Param('id') id: string) {
//     return this.userService.findOneByIdWthRelations(id);
//   }*/

//   /* @Get('asset/:id')
//   findOneByIdWthAsset(@Param('id') id: string) {
//     //return this.userService.findOneByIdWthAsset(id);
//     return this.userService.findOneByIdWthRelations(id);
//   } */

//   @Get('validatePassword')
//   async validatePassword(
//     @UserId() userId: string,
//     @Query('password') password: string,
//   ) {
//     const fnName = 'validatePassword()';
//     const input = `Input : User id : ${userId}, Password : ${password}`;
//     try {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//       this.logger.debug('User : ' + input);
//       return await this.userService.validatePassword(userId, password);
//     } catch (error) {
//       const errMsg = getTryCatchErrorStr(error);
//       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
//       throw new HttpException(
//         errMsg,
//         errMsg.includes(USER_DOES_NOT_EXIST)
//           ? HttpStatus.UNAUTHORIZED
//           : HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     } finally {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'End');
//     }
//   }

//   @Patch('changePassword')
//   async changePassword(
//     @UserId() userId: string,
//     @Query('currentPassword') currentPassword: string,
//     @Query('newPassword') newPassword: string,
//   ) {
//     const fnName = 'changePassword()';
//     const input = `Input : User id : ${userId}, Current Password : ${currentPassword}, New Password : ${newPassword}`;
//     try {
//       this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
//       this.logger.debug(fnName + KEY_SEPARATOR + input);
//       //const userId = getUserIdFromReq(req);
//       /* const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
//       this.logger.debug(`token : ${token}`);
//       const decodedToken = jwtDecode(token!); //Buffer.from(token!, 'base64');
//       const tokenObject = Object.entries(decodedToken);
//       for (const [key, value] of tokenObject) {
//         this.logger.debug(`key : ${key}, value : ${value}`);
//       } */
//       //this.logger.debug('User : ' + JSON.stringify(req.user));
//       if (userId == null) {
//         throw new HttpException(NOT_FOUND, HttpStatus.UNAUTHORIZED);
//       } else {
//         return await this.userService.changePassword(
//           userId,
//           currentPassword,
//           newPassword,
//         );
//       }
//     } catch (error) {
//       const errMsg = getTryCatchErrorStr(error);
//       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
//       throw new HttpException(
//         errMsg,
//         errMsg.includes(CURRENT_PASSWORD_DOES_NOT_MATCH) ||
//         errMsg.includes(USER_DOES_NOT_EXIST)
//           ? HttpStatus.UNAUTHORIZED
//           : HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   @Patch()
//   async update(
//     @UserId() userId: string,
//     @Query() findUserDto: FindUserDto,
//     @Body() updateUserDto: UpdateUserDto,
//   ) {
//     const id = findUserDto.id as string;
//     const fnName = 'update()';
//     const input = `Input : user id : ${id}, Update : ${JSON.stringify(
//       updateUserDto,
//     )}`;
//     this.logger.debug(`${fnName} : ${input}`);
//     //const userId = getUserIdFromReq(req);
//     if (userId == null) {
//       throw new Error(USER_NOT_IN_REQUEST_HEADER);
//     } else {
//       updateUserDto.updatedBy = userId;
//       return await this.userService.update(id, updateUserDto);
//     }
//   }

//   @Patch('restore/:id')
//   restore(@Param('id') id: string) {
//     return this.userService.restore(id);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.userService.delete(id);
//   }

//   @Delete('softDelete')
//   softDelete(@Query('id') id: string, @UserId() userId: string) {
//     return this.userService.softDelete(id, userId);
//   }
// }

export class UserController { }
