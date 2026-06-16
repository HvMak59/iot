import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { Metric } from '../../metrics/entities/metric.entity';
import {
  Entity,
  Column,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
// import { Device } from '../../device/entities/device.entity';
// import { VirtualDevice } from '../../virtual-device/entities/virtual-device.entity';
// import { KEY_SEPARATOR }from 'src/app_config/constants';
// import { Asset } from '../../asset/entities/asset.entity';
import { CreateCurrentTelemetryDto } from '../dto/create-current-telemetry.dto';
// import { MetricsFrequency } from '../../../utils/enums';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { MetricsFrequency } from 'src/common';
import { Device } from 'src/device/entities/device.entity';
import { Asset } from 'src/asset/entities/asset.entity';

@Entity()
//@Unique(['virtualDeviceId', 'metric.metricsAttributeId'])
// @Index(['assetId', 'virtualDeviceId', 'metric.metricsAttributeId'], {
//   unique: true,
// })
export class CurrentTelemetryPayload {
  /* @PrimaryGeneratedColumn('uuid')
    id: string */
  constructor(currentTelemetryPayload?: Partial<CurrentTelemetryPayload>) {
    if (currentTelemetryPayload) {
      Object.assign(this, currentTelemetryPayload);
      this.id = this.getKey();
    } else Object.assign(this, {});
  }

  /* @PrimaryGeneratedColumn('uuid')
  id: string; */

  @PrimaryColumn()
  id: string;

  @Column()
  assetId?: string;

  @Column()
  deviceId?: string;

  @ManyToOne(() => Device, (device) => device.currentTelemetryPayloads, {
    nullable: true,
  })
  device?: Device;


  /* @BeforeInsert()
  //@BeforeUpdate()
  setID() {
    this.id = this.getKey();
  } */

  /*ID is generated in the service */
  /* @BeforeInsert()
  @BeforeUpdate()
  setID() {
    if (!this.id) {
      this.id = this.getKey();
    }
  } */

  // @Column('uuid')
  // telemetryHeaderId: string;

  // @Column()
  // assetId: string;

  /*@Column({ default: false })
  isDeviceGroup: boolean; */

  // @Column({ nullable: true })
  // slaveId?: string;

  // @Column({ nullable: true })
  // deviceId?: string;

  @Column({ nullable: true })
  virtualDeviceId?: string;

  @ManyToOne(
    () => VirtualDevice,
    (virtualDevice) => virtualDevice.currentTelemetryPayloads,
    { nullable: true },
  )
  virtualDevice?: VirtualDevice;

  @Column(() => Metric)
  metric: Metric;

  @ManyToOne(() => Asset, (asset) => asset.currentTelemetryPayloads)
  asset: Asset;

  @Column(() => AuditDateTime)
  auditAttribute: AuditDateTime;

  getKey() {
    /* return `${this.assetId},${this.virtualDeviceId},${this.metric.metricsAttributeId}`; */
    return (
      (this.assetId ?? this.asset?.id ?? '') +
      KEY_SEPARATOR +
      this.virtualDeviceId +
      (this.virtualDeviceId ?? this.virtualDevice?.id ?? '') +
      KEY_SEPARATOR +
      this.metric.metricsAttributeId
    );
  }

  isArrivedCTPLOlder(
    arrivedCTPL: CreateCurrentTelemetryDto | CurrentTelemetryPayload,
  ) {
    return (
      this.metric.txnCaptureTime.valueOf() >
      (arrivedCTPL.metric?.txnCaptureTime.valueOf() ?? 0)
    );
  }

  isPeriodTelemetry() {
    return !(this.metric?.frequency === MetricsFrequency.INSTANT);
  }

  hasArrivedCTPLNotIncreased(
    arrivedCTPL: CreateCurrentTelemetryDto | CurrentTelemetryPayload,
  ) {
    if (arrivedCTPL.metric == null) {
      return false;
    } else {
      return !this.hasArrivedCTPLIncreased(arrivedCTPL);
    }
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

  hasArrivedCTPLIncreased(
    arrivedCTPL: CreateCurrentTelemetryDto | CurrentTelemetryPayload,
  ) {
    if (arrivedCTPL.metric == null) {
      return false;
    } else {
      return (
        parseFloat(this.metric.measure) <
        parseFloat(arrivedCTPL.metric?.measure)
      );
    }
  }
}
