import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getUserIdFromReq } from './others';
// import { getUserIdFromReq } from './other';

// export const UserId = createParamDecorator(
//   (data: unknown, context: ExecutionContext) => {
//     const host = context.switchToHttp();
//     const request = host.getRequest<Request>();
//     return getUserIdFromReq(request);
//   },
// );
import { Request } from 'express';

export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    return getUserIdFromReq(request);
  },
);


// import { Request } from 'express';

// export function getTokenFromReq(req: Request): string {
//   const authHeader = req.headers['authorization'];

//   if (!authHeader) {
//     throw new Error('Authorization token is missing');
//   }

//   // Already "Bearer xxx"
//   if (authHeader.startsWith('Bearer ')) {
//     return authHeader;
//   }

//   // Raw token → add Bearer
//   return `Bearer ${authHeader}`;
// }


