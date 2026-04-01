import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './entities/local_strategy';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './entities/jwt-strategy';
import { UserModule } from 'src/user/user.module';
// import { OtpModule } from 'src/otp/otp.module';
// import { CustomerModule } from 'src/customer/customer.module';

@Module({
  imports: [
    PassportModule,
    HttpModule,
    UserModule,
    // OtpModule,
    // CustomerModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule { }
