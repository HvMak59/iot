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
import { KEY_SEPARATOR, SEPARATOR } from 'src/app_config/constants';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import { Metric } from 'src/metrics/entities/metric.entity';
import { Asset } from 'src/asset/entities/asset.entity';
import { Device } from 'src/device/entities/device.entity';

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

  @ManyToOne(() => Asset, (asset) => asset.currentTelemetryPayloads)
  asset: Asset;

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

  @Column({ nullable: true })
  deviceId?: string;

  @ManyToOne(() => Device, (device) => device.telemetryPayloads, {
    nullable: true,
  })
  device?: Device;

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

  getVDKey() {
    return (
      (this.assetId ?? this.asset?.id ?? '') +
      KEY_SEPARATOR +
      (this.virtualDeviceId ?? this.virtualDevice?.id ?? '')
    );
  }

  getAssetVDMetricKey() {
    return this.getKey();
  }

  getTelemetryKey() {
    return (
      this.assetId +
      SEPARATOR +
      this.virtualDeviceId +
      SEPARATOR +
      this.metric?.metricsAttributeId +
      SEPARATOR +
      this.metric.frequency +
      SEPARATOR +
      this.metric?.txnCapturePeriod
    );
  }

  // getTelemetryKey() {
  //   return JSON.stringify({
  //     assetId: this.assetId,
  //     virtualDeviceId: this.virtualDeviceId,
  //     metricsAttributeId: this.metric?.metricsAttributeId,
  //     frequency: this.metric?.frequency,
  //     txnCapturePeriod: this.metric?.txnCapturePeriod,
  //   });
  // }
}
