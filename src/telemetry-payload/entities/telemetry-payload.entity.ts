// import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
// import { Metric } from '../../metrics/entities/metric.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { TelemetryPayloadsRepo } from './telemetry-payload_repo.entity';
// import { VirtualDevice } from 'virtual-device/entities/virtual-device.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import { Metric } from 'src/metrics/entities/metric.entity';

// @Entity()
// @Index(
//   [
//     'assetId',
//     'virtualDeviceId',
//     'metric.metricsAttributeId',
//     'metric.txnCapturePeriod',
//   ],
//   { unique: true },
// )
@Entity()
@Index(
  [
    'assetId',
    'virtualDeviceId',
    'metric.metricsAttributeId',
    'metric.txnCapturePeriod',
  ],
  {
    //unique: true,
    where: `"virtualDeviceId" IS NOT NULL`,
  },
)
@Index(['assetId', 'metric.metricsAttributeId', 'metric.txnCapturePeriod'], {
  //unique: true,
  where: `"virtualDeviceId" IS NULL`,
})
/* @Unique([
  'virtualDeviceId',
  'metric.metricsAttributeId',
  'metric.txnCapturePeriod',
]) */
export class TelemetryPayload {
  constructor(telemetryPayload?: Partial<TelemetryPayload>) {
    if (telemetryPayload) {
      Object.assign(this, telemetryPayload);
    } else Object.assign(this, {});
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  telemetryHeaderId: string;

  @Column()
  assetId: string;

  @Column({ nullable: true })
  slaveId?: string;

  @Column({ nullable: true })
  virtualDeviceId?: string;

  @ManyToOne(
    () => VirtualDevice,
    (virtualDevice) => virtualDevice.telemetryPayloads,
    { nullable: true },
  )
  virtualDevice?: VirtualDevice;

  @Column(() => Metric)
  metric: Metric;

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  getKey() {
    /* return `${this.assetId},${this.virtualDeviceId},${this.metric.metricsAttributeId},${this.metric.txnCaptureTime}`; */
    return `${this.virtualDeviceId},${this.metric.metricsAttributeId},${this.metric.txnCaptureTime}`;
  }

  getAttributeKey() {
    /* return `${this.assetId},${this.virtualDeviceId},${this.metric.metricsAttributeId}`; */
    return (
      // (this.assetId ?? this.asset?.id ?? '') +
      // KEY_SEPARATOR +
      //this.virtualDeviceId +
      (this.virtualDeviceId ?? this.virtualDevice?.id ?? '') +
      KEY_SEPARATOR +
      this.metric.metricsAttributeId
    );
  }

  getAttributeKeyIncl10thMin() {
    const metricDt = new Date(this.metric.txnCaptureTime);
    return this.getAttributeKey() + KEY_SEPARATOR + metricDt.getHours() + KEY_SEPARATOR + (metricDt.getMinutes() / 10).toFixed(0);
  }

  getTelemetryKey() {
    return (
      this.assetId +
      KEY_SEPARATOR +
      this.virtualDeviceId +
      KEY_SEPARATOR +
      this.metric?.metricsAttributeId +
      KEY_SEPARATOR +
      this.metric.frequency +
      KEY_SEPARATOR +
      this.metric?.txnCapturePeriod
    );
  }
}
