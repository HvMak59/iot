import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
import { User } from '../entities/user.entity';

/* export class FindUserDto extends PartialType(User) {
  constructor(findUserDto: FindUserDto) {
    super(findUserDto);
    Object.assign(this, findUserDto ? findUserDto : {});
    //findUserDto ? Object.assign(this, findUserDto) : Object.assign(this, {});
  }
} */
export interface FindUserDto extends FindOptionsWhere<User> {}
