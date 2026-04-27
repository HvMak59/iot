// token.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { getBearerToken } from './others';

export const Token = createParamDecorator(
    (_data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();
        // return getTokenFromReq(request);
        const authHeader = request.headers.authorization;

        // console.log(ExtractJwt.fromAuthHeaderAsBearerToken()(request));

        return getBearerToken(authHeader);
    },
);
