import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  //

  async validate(payload: any) {
    // console.log("auth strategy user", payload);
    return {
      userId: payload.sub,
      username: payload.username,
      // role: payload.role 
      // roles: payload.role.map((r: any) => r.roleId),
      roles: Array.isArray(payload.role)
        ? payload.role.map((r: any) => r.roleId)
        : [],
    };
  }
}
