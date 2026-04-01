// import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';

import * as bcrypt from 'bcrypt';
import { INVALID_USERNAME_OR_PASSWORD, NO_OF_SALTS } from 'src/app_config/constants';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super();
  }

  // async validate(username: string, password: string) {
  //   console.log("in local");
  //   // const user = await this.userService.findOneWithPassword({ id: username });
  //   const user = await this.userService.findOneWithPasswordd({ id: username });
  //   // console.log("local strategy user", user);
  //   const encryptedPassword = await bcrypt.hash(password, NO_OF_SALTS);
  //   if (user) {
  //     const hasPwdMatched = await bcrypt.compare(password, user.password);
  //     if (hasPwdMatched) {
  //       return user;
  //     } else {
  //       throw new HttpException(
  //         INVALID_USERNAME_OR_PASSWORD,
  //         HttpStatus.UNAUTHORIZED,
  //       );
  //     }
  //   } else {
  //     throw new HttpException(
  //       INVALID_USERNAME_OR_PASSWORD,
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }
  // }
}
