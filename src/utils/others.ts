import { HttpException, HttpStatus } from '@nestjs/common';
import { DUPLICATE_RECORD, NO_RECORD } from 'src/app_config/constants';
import { AxiosError, AxiosResponse } from 'axios';
import { ValidationError } from 'class-validator';
import _ from 'lodash';
// import { Asset } from '../src/asset/entities/asset.entity';
// import { Device } from '../src/device/entities/device.entity';
// import { GroupMetricsAttributeAggregation } from '../src/group-metrics-attribute-aggregation/entities/group-metrics-attribute-aggregation.entity';
// import { Metric } from '../src/metrics/entities/metric.entity';
// import { TelemetryPayload } from '../src/telemetry-payload/entities/telemetry-payload.entity';
// import { MetricsFrequency } from './enums';

import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { jwtDecode } from 'jwt-decode';
import { MetricsFrequency } from 'src/common';
import { Asset } from 'src/asset/entities/asset.entity';
import { Device } from 'src/device/entities/device.entity';
import { Metric } from 'src/metrics/entities/metric.entity';
import { TelemetryPayload } from 'src/telemetry-payload/entities/telemetry-payload.entity';
// import { MetricsFrequency } from 'common';
// import { Asset } from 'asset/entities/asset.entity';
// import { Metric } from 'metrics/entities/metric.entity';
// import { Device } from 'device/entities/device.entity';
// import { TelemetryPayload } from 'telemetry-payload/entities/telemetry-payload.entity';
// import { VirtualDeviceGroup } from 'src/virtual-device-group/entities/virtual-device-group.entity';

export function parseDate(dateString: string): Date {
  if (dateString) {
    const dateComponents = dateString.split('-');
    const yyyy = parseInt(dateComponents[0]);
    const mm = parseInt(dateComponents[1]) - 1;
    const dd = parseInt(dateComponents[2]);

    const parsedDate = new Date();
    parsedDate.setFullYear(yyyy, mm, dd);

    return parsedDate;
  } else return new Date();
}

export function createErrMsg(
  serviceName: string,
  resp?: AxiosResponse<any, any> | AxiosError,
) {
  let errMsg = `${serviceName} :  ${resp?.config?.url} : ${resp?.status}`;
  resp instanceof AxiosError
    ? null
    : (errMsg = `${errMsg} : ${resp?.statusText}`);
  return errMsg;
}

export function getSearchParamsforURL(url: URL, searchParams: string): URL {
  const searchParamsJSON = JSON.parse(searchParams);
  for (let objectProperty in searchParamsJSON) {
    console.log(
      `getSearchParamsforURL : Properties : ${objectProperty} : ${searchParamsJSON[objectProperty]}`,
    );
    if (objectProperty !== undefined) {
      url.searchParams.append(objectProperty, searchParamsJSON[objectProperty]);
    }
  }
  return url;
}

export function getTryCatchErrorStr(error: any): string {
  if (error instanceof Error) {
    return (error as Error).message;
  } else return String(error);
}

export function getServiceResponseStatus(
  resp: AxiosResponse,
  showData = false,
): string {
  let respString: string;
  respString = `${resp.config.url} : ${resp.config.method}`;
  resp.config.params
    ? (respString = `${respString} : Params : ${resp.config.params}`)
    : null;
  if (showData) {
    resp.config.data
      ? (respString = `${respString} : Data : ${resp.config.data}`)
      : null;
  }
  respString = `${respString} : ${resp.status} : ${resp.statusText}`;
  return respString;
}

/* export function getServiceResponseStatus(resp: AxiosResponse): string {
  let respString: string;
  respString = `URL`;
  resp.config.baseURL
    ? respString.concat(` : ${resp.config.baseURL}/`)
    : respString.concat(` : `);
  respString = `${resp.config.url}, Method : ${resp.config.method}`;
  resp.config.params
    ? (respString = `${respString}\nParams : ${JSON.stringify(
        resp.config.params,
      )}`)
    : null;
  resp.config.data
    ? (respString = `${respString}\nData : ${resp.config.data}`)
    : null;
  respString = `${respString}\n ${resp.status}\n ${resp.statusText}`;
  return respString;
} */

export function isSrvcRespSuccessful(resp: AxiosResponse): boolean {
  return (
    resp.status == HttpStatus.OK || resp.status == HttpStatus.CREATED /* &&
    resp.data */
  );
}

export function maximumDate(date1: Date, date2: Date) {
  const newDate1 = new Date(date1);
  const newDate2 = new Date(date2);
  let maxDate;

  newDate1 > newDate2 ? (maxDate = newDate1) : (maxDate = newDate2);

  return maxDate;
}

export function maximum<T>(x: T, y: T) {
  if (typeof x == 'number' && typeof y == 'number') {
    return x > y ? x : y;
  }
}

export function throwErrIfSrvcRespFailure(resp: AxiosResponse) {
  if (!isSrvcRespSuccessful(resp)) {
    throw new Error(getServiceResponseStatus(resp));
  }
}

export function throwErrIfNoRespData(resp: AxiosResponse, errMsg: string) {
  if (_.isNil(resp.data)) {
    throw new Error(errMsg);
  } else if (/* isArray(resp.data) && */ _.isEmpty(resp.data)) {
    throw new Error(errMsg);
  }
}

export function convertInputToDate(input: string | number | Date): Date {
  if (input instanceof Date) {
    return input;
  } else if (typeof input === 'number') {
    return new Date(input);
  } else if (typeof input === 'string') {
    const parsedDate = new Date(convertpossibleStringTypeToInt(input));
    return parsedDate;
  } else {
    throw new Error('Input must be a string, number, or Date object');
  }
}


export function throwErrIfNoData<T>(resp: Array<T>, errMsg: string) {
  if (_.isNil(resp.length)) {
    throw new Error(errMsg);
  } else if (/* isArray(resp.data) && */ _.isEmpty(resp)) {
    throw new Error(errMsg);
  }
}
export function throwErrIfValidationFails(
  errors: ValidationError[],
  addlErrMsg?: string,
) {
  if (!_.isEmpty(errors)) {
    const errMsg = addlErrMsg
      ? addlErrMsg.concat(`: ${[...errors]}`)
      : `: ${[...errors]}`;
    throw new Error(errMsg);
  }
}

export function convertpossibleStringTypeToInt(
  givenStringOrNumber: string | number,
) {
  return typeof givenStringOrNumber == 'string'
    ? Number(givenStringOrNumber).valueOf()
    : givenStringOrNumber;
}

export function throwErrIfObjectUndefinedOrNull(
  obj: Object,
  errMsgPrefix?: string,
) {
  if (_.isNil(obj)) {
    throw new Error(`${errMsgPrefix} Object is null`);
  }
}

export function getPeriodTime(
  txnCaptureTime: Date,
  frequency?: MetricsFrequency,
): Date {
  let txnDate = new Date(txnCaptureTime);
  let txnCapturePeriod: Date;
  switch (frequency) {
    case MetricsFrequency.INSTANT:
      txnCapturePeriod = txnDate;
      break;
    /* case MetricsFrequency.WEEKLY:
      break; */
    case MetricsFrequency.DAILY:
      txnCapturePeriod = new Date(
        txnDate.getFullYear(),
        txnDate.getMonth(),
        txnDate.getDate(),
      );
      break;
    case MetricsFrequency.MONTHLY:
      txnCapturePeriod = new Date(txnDate.getFullYear(), txnDate.getMonth());
      break;
    /* case MetricsFrequency.QUARTERLY:
      break; */
    case MetricsFrequency.YEARLY:
    case MetricsFrequency.TOTAL:
      txnCapturePeriod = new Date(txnDate.getFullYear(), 0);
      break;
    default:
      txnCapturePeriod = txnCaptureTime;
      break;
  }
  return txnCapturePeriod;
}

export function getAssetTypeID(asset: Asset) {
  return asset.assetTypeId;
}
// export function getAssetEntityState(asset: Asset) {
//   return asset.entityState.entityStateValue;
// }

// export function getGroupIDFromGroupMetricsAttribAgg(
//   record: GroupMetricsAttributeAggregation,
// ) {
//   return record.groupId;
// }

// export function getMetricsAttribAggregationFromGroupMetricsAttribAgg(
//   record: GroupMetricsAttributeAggregation,
// ) {
//   return record.metricsAttributeAggregation;
// }

export function getAssetID(asset: Asset) {
  return asset.id;
}

export function getMetricDTO(metric: Partial<Metric>) {
  const { txnCaptureTime, frequency, metricsAttributeId, unit, ...metricDto } =
    metric;
  return metricDto;
}

export function getDeviceID(device: Device) {
  return device.id;
}

export function isPeriodTelemetry(metric: Metric) {
  return (
    metric.frequency != undefined &&
    metric.frequency != null &&
    metric.frequency != MetricsFrequency.INSTANT
  );
}

export function hasPeriodTelemetryIncreased(
  latestMetric: Metric,
  incomingMetric: Metric,
) {
  return parseFloat(incomingMetric.measure) > parseFloat(latestMetric.measure);
}

export function getTelemetryPayloadKey(telemetryPayload: TelemetryPayload) {
  const newTelemetry = new TelemetryPayload(telemetryPayload);
  return newTelemetry.getKey();
}

export function getTokenString(token: string) {
  return `Bearer ${token}`;
}

export function sendException(errMsg: string) {
  if (errMsg.startsWith(DUPLICATE_RECORD)) {
    throw new HttpException(errMsg, HttpStatus.CONFLICT);
  } else if (errMsg.startsWith(NO_RECORD)) {
    throw new HttpException(errMsg, HttpStatus.NO_CONTENT);
  } else throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
}

// export function getUserIdFromReq(req: Request) {
//   const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
//   const decodedToken = jwtDecode(token!);
//   /* const tokenObject = Object.entries(decodedToken);
//   for (const [key, value] of tokenObject) {
//     this.logger.debug(`key : ${key}, value : ${value}`);
//   } */
//   return decodedToken.sub;
//   /* this.logger.debug(`userIdFromObject : ${userIdFromObject}`); //Buffer.from(token!, 'base64');
//   const tokenItems = JSON.stringify(decodedToken).split(',');
//   const firstToken = tokenItems[0];
//   const userIdWithQuotes = tokenItems[0].split(':')[1];
//   const userId = userIdWithQuotes.replace(/['"]/g, '');
//   return { userId, decodedToken }; */
// }

export function getUserIdFromReq(req: Request) {
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  const decodedToken = jwtDecode(token!);
  console.log(decodedToken);
  return decodedToken.sub;
}

export function getBearerToken(token?: string): string {
  if (!token) {
    throw new Error('Authorization token is missing');
  }

  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

export function getPeriodTimeInEpoch(
  txnCaptureTime: number,
  frequency: string,
): number {
  let txnDate = new Date(txnCaptureTime);
  let txnCapturePeriodInEpoch: number;
  switch (frequency) {
    case MetricsFrequency.INSTANT.toString():
      txnCapturePeriodInEpoch = txnDate.valueOf();
      break;
    /* case MetricsFrequency.WEEKLY:
        break; */
    case MetricsFrequency.DAILY.toString():
      txnCapturePeriodInEpoch = new Date(
        txnDate.getFullYear(),
        txnDate.getMonth(),
        txnDate.getDate(),
      ).valueOf();
      break;
    case MetricsFrequency.MONTHLY.toString():
      txnCapturePeriodInEpoch = new Date(
        txnDate.getFullYear(),
        txnDate.getMonth(),
      ).valueOf();
      break;
    /* case MetricsFrequency.QUARTERLY:
        break; */
    case MetricsFrequency.YEARLY.toString():
    case MetricsFrequency.TOTAL.toString():
      txnCapturePeriodInEpoch = new Date(txnDate.getFullYear(), 0).valueOf();
      break;
    default:
      txnCapturePeriodInEpoch = new Date(txnCaptureTime).valueOf();
      break;
  }
  return txnCapturePeriodInEpoch;
}


// export function VirtualDeviceGroupComparator(vdg: VirtualDeviceGroup) {
//   const vdgObj = new VirtualDeviceGroup(vdg);
//   return vdgObj.id;
// }
/* export function updatePeriodTxnTime(metric: Metric) {
  let txnDate = new Date(metric.txnCaptureTime);
  const logger = winstonServerLogger('others.updatePeriodTxnTime');
  switch (metric.frequency) {
    case MetricsFrequency.INSTANT:
      metric.txnCapturePeriod = metric.txnCaptureTime;
      break;
    case MetricFrequency.WEEKLY :
      break;
    case MetricsFrequency.DAILY:
      metric.txnCapturePeriod = new Date(
        txnDate.getFullYear(),
        txnDate.getMonth(),
        txnDate.getDate(),
      );
      break;
    case MetricsFrequency.MONTHLY:
      metric.txnCapturePeriod = new Date(
        txnDate.getFullYear(),
        txnDate.getMonth(),
      );
      break;
    case MetricFrequency.QUARTERLY :
      break;
    case MetricsFrequency.YEARLY:
      metric.txnCapturePeriod = new Date(txnDate.getFullYear(), 0);
      break;
    default:
      metric.txnCapturePeriod = metric.txnCaptureTime;
      logger.warn(
        `Metric attribute ${metric.metricsAttributeId} does not have defined frequency`,
      );
      break;
  }
  logger.debug(
    `Metric attribute ${metric.metricsAttributeId} metric.txnCapturePeriod is : ${metric.txnCapturePeriod}`,
  );
} */
