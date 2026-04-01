import { getPeriodTime } from 'src/utils/others';
import { Metric } from '../entities/metric.entity';

/* As of now, we have avoided the tight relationship with MetricsAttribute */
export class MetricDto {
  constructor(metric: Partial<Metric>) {
    const {
      txnCaptureTime,
      frequency,
      metricsAttributeId,
      unit,
      ...metricDto
    } = metric;
    Object.assign(this, metricDto);
    if (metric.txnCaptureTime) {
      this.txnCaptureTimeInEpoch = new Date(metric.txnCaptureTime).valueOf();
      //this.txnCaptureTimeInEpoch = this.txnCaptureTime;
    }
    this.txnCapturePeriodInEpoch = metric.txnCapturePeriod
      ? new Date(metric.txnCapturePeriod).valueOf()
      : new Date(
        getPeriodTime(metric.txnCaptureTime!, metric.frequency),
      ).valueOf();
    /*  this.txnCapturePeriod = metric.txnCapturePeriod
      ? metric.txnCapturePeriod.valueOf()
      : undefined; */
  }
  //metricsAttributeId: string;

  measure: string;

  //unit?: string;

  //frequency: string;

  txnCaptureTime?: number;

  txnCaptureTimeInEpoch?: number;

  isCalculated: boolean;

  txnCapturePeriodInEpoch?: number;

  /* @Column(() => AuditAttribute)
  auditDateTime: AuditAttribute; */
}
