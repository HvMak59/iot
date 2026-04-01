import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { User } from 'src/user/entity/user.entity';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
// import { CustomerService } from 'src/customer/customer.service';
import { RegisterDto } from './dto';
import { FindUserDto } from 'src/user/dto/find-user.dto';

import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
// import { OtpService } from 'src/otp/otp.service';
// import { VerifyOtpDto } from 'src/otp/dto/verify-otp.dto';
import { RoleType } from 'src/common';
import { User } from 'src/user/entities/user.entity';
// import { Otp } from 'src/otp/entities/otp.entity';

@Injectable()
export class AuthService {
  private baseURL = process.env['BASE_URL'];
  private logger = winstonServerLogger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    // private readonly otpService: OtpService,
    // private readonly customerService: CustomerService,
  ) { }

  /* async authenticate(username: string, password: string) {
    const fnName = 'authenticate()';
    const input = `Input : ${username}`;
    try {
      const findUserDTO: FindUserDto = {
        id: username,
      };
      const user = await this.userService.authenticate(findUserDTO);
      if (user) {
        const hasPwdMatched = await bcrypt.compare(password, user.password);
        if (hasPwdMatched) {
          return user;
        } else {
          throw new Error(PASSWORD_DOES_NOT_MATCH);
        }
      } else {
        throw new Error(USER_DOES_NOT_EXIST);
      }
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(fnName + KEY_SEPARATOR + errMsg);
      throw new Error(errMsg);
    } finally {
      this.logger.debug(fnName + KEY_SEPARATOR + 'End');
    }
  } */

  async login(user: User) {
    this.logger.debug(`login() : ${JSON.stringify(user)}`);
    // const roles = user.userRoles.map(r => r.roleId);
    const payload = {
      username: user.name,
      sub: user.id,
      role: user.userRoles
      // roles    //change role guard accordingly 
    };
    // console.log(payload);
    return this.jwtService.sign(payload);
  }


  // async register(registerDto: RegisterDto) {
  //   const { name, emailId, password } = registerDto;

  //   // 
  //   // check user exists 
  //   const existingUser = await this.userService.findOne(emailId as FindUserDto);

  //   if (existingUser) {
  //     throw new BadRequestException('Email already registered');
  //   }

  //   // hash password
  //   // const hashedPassword = await bcrypt.hash(password, 10);

  //   const createUserDto: CreateUserDto = {
  //     // name,email,password:hashedPassword
  //     name, emailId, password
  //   }
  //   // const user = this.userService.create({
  //   //   name,
  //   //   email,
  //   //   password: hashedPassword,
  //   // });

  //   // const user = await this.userService.create(createUserDto);
  //   // auto-login after register (optional but recommended)
  //   // return this.login(user);
  // }

  // async loginWithOtp(phone: string) {
  // async loginWithOtp(email: string) {



  // async loginWithOtp(otp: Otp) {
  //   const valid = await this.otpService.verifyOtp(otp.emailId, otp.otp);

  //   if (!valid) {
  //     throw new UnauthorizedException('Invalid OTP');
  //   }

  //   const customer = await this.customerService.findOne({ emailId: dto.emailId });
  //   if (customer) {
  //     const payload = {
  //       sub: customer.id,
  //       email: customer.emailId,
  //       role: RoleType.CUSTOMER,
  //     };

  //     return {
  //       accessToken: this.jwtService.sign(payload),
  //       isNewCustomer: false,
  //     };
  //   }

  //   const payload = {
  //     sub: dto.emailId,
  //     email: dto.emailId,
  //     role: RoleType.CUSTOMER
  //   };

  //   return {
  //     accessToken: this.jwtService.sign(payload),
  //     isNewCustomer: true,
  //   };
  // }

  private working = 5;
  // async loginWithOtp(dto: VerifyOtpDto) {
  //   console.log("in otp login service");
  //   const valid = await this.otpService.verifyOtp(dto.emailId, dto.otp);

  //   if (!valid) {
  //     throw new UnauthorizedException('Invalid OTP');
  //   }

  //   const customer = await this.customerService.findOne({ emailId: dto.emailId });
  //   // console.log(customer);
  //   if (customer) {
  //     // const payload = {
  //     //   sub: customer.id,
  //     //   emailId: customer.emailId,
  //     //   role: RoleType.CUSTOMER,
  //     // };

  //     const payload = {
  //       username: customer.name,
  //       sub: customer.id,
  //       role: RoleType.CUSTOMER
  //     }

  //     // return {
  //     //   accessToken: this.jwtService.sign(payload),
  //     //   // isNewCustomer: false,
  //     // };
  //     return this.jwtService.sign(payload);
  //   }

  //   const payload = {
  //     // sub: dto.emailId,
  //     // emailId: dto.emailId,
  //     // role: RoleType.CUSTOMER

  //     username: dto.emailId,
  //     sub: dto.emailId,
  //     role: RoleType.CUSTOMER
  //   };

  //   // console.log(payload)
  //   // return {
  //   //   accessToken: this.jwtService.sign(payload),
  //   //   // isNewCustomer: true,
  //   // };
  //   return this.jwtService.sign(payload);
  // }


  private idk = 4;
  // async loginWithOtp(dto: VerifyOtpDto) {
  //   const valid = await this.otpService.verifyOtp(dto.email, dto.otp);

  //   if (!valid) {
  //     throw new UnauthorizedException('OTP invalid');
  //   }

  //   const payload = {
  //     email: dto.email,
  //     type: 'CUSTOMER',
  //   };

  //   return {
  //     accessToken: this.jwtService.sign(payload),
  //   };
  // }
}
