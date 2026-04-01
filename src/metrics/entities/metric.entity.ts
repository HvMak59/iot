import { MetricsFrequency } from 'src/common';
import { getPeriodTime } from 'src/utils/others';
import { AfterLoad, Column } from 'typeorm';
// import { getPeriodTime } from '../../../utils/others';
// import { MetricsFrequency } from '../../../utils/enums';

/* As of now, we have avoided the tight relationship with MetricsAttribute */
export class Metric {
  constructor(metric: Partial<Metric>) {
    if (metric) {
      Object.assign(this, metric);
      /* this.txnCaptureTimeInEpoch = metric.txnCaptureTime?.valueOf(); */
      this.txnCapturePeriod = getPeriodTime(
        metric.txnCaptureTime!,
        metric.frequency,
      );
    }
  }

  @Column()
  metricsAttributeId: string;

  @Column()
  measure: string;

  @Column({ nullable: true })
  unit?: string;

  @Column({
    type: 'enum',
    enum: MetricsFrequency,
    default: MetricsFrequency.INSTANT,
  })
  frequency: MetricsFrequency;

  @Column({ type: 'timestamptz' })
  txnCaptureTime: Date;

  @Column({ type: 'timestamptz' })
  txnCapturePeriod: Date;

  @Column({ default: false })
  isCalculated: boolean;

  txnCaptureTimeInEpoch?: number;
  txnCapturePeriodInEpoch?: number;

  isForToday() {
    let txnDate = new Date(this.txnCaptureTime);
    let today = new Date();
    return (
      txnDate.getFullYear() == today.getFullYear() &&
      txnDate.getMonth() == today.getMonth() &&
      txnDate.getDate() == today.getDate()
    );
  }

  isBetweenHours(startHour: number, endHour: number) {
    const txnDate = new Date(this.txnCaptureTime);
    const txnHour = txnDate.getHours();
    return txnHour >= startHour || txnHour < endHour;
  }

  /* isBetweenGivenHrs(startHr: number, endHr: number) {
    const txnDate = new Date(this.txnCaptureTime);
    return txnDate.getHours() >= startHr && txnDate.getHours() <= endHr;
  } */

  isPeriodic() {
    return this.frequency !== MetricsFrequency.INSTANT;
  }

  @AfterLoad()
  setTimeInEpoch() {
    this.txnCaptureTimeInEpoch = this.txnCaptureTime.valueOf();
    this.txnCapturePeriodInEpoch = this.txnCapturePeriod.valueOf();
    /*  if (this.txnCaptureTime) {
      this.txnCaptureTimeInEpoch = this.txnCaptureTime.valueOf();
    } */
  }

  /* @BeforeInsert()
  updateTxnCapturePeriod() {
    let txnDate = new Date(this.txnCaptureTime);
    switch (this.frequency) {
      case MetricsFrequency.INSTANT:
        this.txnCapturePeriod = this.txnCaptureTime;
        break;
      case MetricFrequency.WEEKLY :
        break;
      case MetricsFrequency.DAILY:
        this.txnCapturePeriod = new Date(
          txnDate.getFullYear(),
          txnDate.getMonth(),
          txnDate.getDate(),
        );
        break;
      case MetricsFrequency.MONTHLY:
        this.txnCapturePeriod = new Date(
          txnDate.getFullYear(),
          txnDate.getMonth(),
        );
        break;
      case MetricFrequency.QUARTERLY :
        break;
      case MetricsFrequency.YEARLY:
        this.txnCapturePeriod = new Date(txnDate.getFullYear(), 0);
        break;
      default:
        this.logger.error(
          `Metric frequency ${this.frequency} is not supported`,
        );
        break;
    }
    this.logger.debug(`this.txnCapturePeriod is : ${this.txnCapturePeriod}`);
  } */

  /* @Column(() => AuditAttribute)
  auditDateTime: AuditAttribute; */
}
