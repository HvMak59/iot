import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isProd = process.env.NODE_ENV === 'production';

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Internal server error';
        let stack: string | undefined;

        // Handle NestJS HttpException
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message =
                typeof res === 'string'
                    ? res
                    : (res as any).message || message;
            if (!isProd) stack = exception.stack;
        }
        // Handle TypeORM errors like QueryFailedError
        else if (exception?.driverError?.detail) {
            message = isProd ? 'Database query error' : exception.driverError.detail;
            if (!isProd) stack = exception.stack;
        }
        // Other exceptions
        else if (exception?.message) {
            message = isProd ? 'Internal server error' : exception.message;
            if (!isProd) stack = exception.stack;
        }

        // Log full exception in server console always
        console.error('Exception caught by filter:', exception);

        const responseBody: any = {
            statusCode: status,
            path: request.url,
            message,
        };

        if (stack && !isProd) {
            responseBody.stack = stack; // Only in dev
        }
        response.status(status).json(responseBody);
    }
}




// import {
//     ExceptionFilter,
//     Catch,
//     ArgumentsHost,
//     HttpException,
//     HttpStatus,
// } from '@nestjs/common';
// import { Request, Response } from 'express';

// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//     catch(exception: any, host: ArgumentsHost) {
//         const ctx = host.switchToHttp();
//         const response = ctx.getResponse<Response>();
//         const request = ctx.getRequest<Request>();

//         let status = HttpStatus.INTERNAL_SERVER_ERROR;
//         let message = 'Internal server error';

//         if (exception instanceof HttpException) {
//             status = exception.getStatus();
//             const res = exception.getResponse();
//             message =
//                 typeof res === 'string'
//                     ? res
//                     : (res as any).message || message;
//         }

//         else if (exception?.driverError?.detail) {
//             message = exception.driverError.detail;
//         } else if (exception?.message) {
//             message = exception.message;
//         }

//         response.status(status).json({
//             statusCode: status,
//             path: request.url,
//             message,
//         });
//     }
// }