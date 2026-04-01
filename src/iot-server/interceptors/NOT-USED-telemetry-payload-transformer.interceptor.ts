import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Response,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { first, map, Observable, Observer, tap } from 'rxjs';
import { TelemetryPayload } from 'src/telemetry-payload/entities/telemetry-payload.entity';

class onlyTelemetryPayload {
  measureName: string;
  measureValue: string;
  measureUnit?: string;
  txnCaptureTime: Date;
  isCalculated: boolean = false;
}

class NormalizedTelemetryPayload {
  id: string;
  telemetryHeaderId: string;
  assetId: string;
  source: string;
  instanceId: string;
  virtualInstanceId: string;
  onlyTelemetryPayloads: Array<onlyTelemetryPayload>;
}

/* export interface Response<T> {
    data: T;
} */

@Injectable()
export class TelemetryPayloadTransformer<TelemetryPayload>
  implements NestInterceptor<TelemetryPayload, AxiosResponse<TelemetryPayload>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    /* console.log('Interceptor');
        console.log('class : ', context.getClass());
        console.log('args : ', context.getArgs()); */
    //console.log('response : ', context.switchToHttp().getResponse());
    /* return next.handle().pipe(map(data => ({
            data
        }))); */
    return next.handle().pipe(
      map((data) => {
        console.log('After the response', data.length);
      }),
    );
  }

  /* response1: Partial<Observer<any>> = {
        next: (data: TelemetryPayload[]) => {
            console.log(`Received data in interceptor : ${JSON.stringify([...data])}`);
        }

    } */
}
