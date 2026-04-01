import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DUPLICATE_RECORD,
  KEY_SEPARATOR,
  NO_RECORD,
} from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { Repository } from 'typeorm';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { FindUserRoleDto } from './dto/find-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class UserRoleService {
  private readonly logger = winstonServerLogger(UserRoleService.name);

  constructor(
    @InjectRepository(UserRole) private readonly repo: Repository<UserRole>,
  ) { }
  async create(createUserRoleDto: CreateUserRoleDto) {
    const fnName = 'create()';
    const input = `Input Create Object : ${JSON.stringify(createUserRoleDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const userRole = await this.repo.findOneBy({
      userId: createUserRoleDto.userId,
      roleId: createUserRoleDto.roleId,
    });

    if (userRole) {
      const errMsg = `${userRole.userId}-${userRole.roleId} already exists`;
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new Error(`${DUPLICATE_RECORD} : ${errMsg}`); //.json(org);
    } else {
      const userRoleObj = this.repo.create(createUserRoleDto);
      const savedUserRole = await this.repo.save(userRoleObj);

      this.logger.debug(`Saved UserRole : ${savedUserRole}`);

      return savedUserRole;
    }
  }

  findAll() {
    return `This action returns all userRole`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userRole`;
  }

  async update(updateUserRoleDto: UpdateUserRoleDto) {
    const fnName = 'update()';
    const input = `Input : Update Object : ${JSON.stringify(
      updateUserRoleDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const mergedUserRole = await this.repo.preload(updateUserRoleDto);

    if (mergedUserRole == null) {
      const errMsg = `${updateUserRoleDto.userId}-${updateUserRoleDto.roleId} does not exist`;
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new Error(`${NO_RECORD} : ${errMsg}`);
    } else {
      this.logger.debug(
        `${fnName} : Merged UserRole is : ${JSON.stringify(mergedUserRole)}`,
      );

      const savedUserRole = await this.repo.save(mergedUserRole);
      this.logger.debug(
        `${fnName} Saved UserRole is : ${JSON.stringify(savedUserRole)}`,
      );

      return savedUserRole;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} userRole`;
  }
}
