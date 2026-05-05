import { KEY_SEPARATOR } from 'src/app_config/constants';
import { Asset } from 'src/asset/entities/asset.entity';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import { Device } from 'src/device/entities/device.entity';
import { Metric } from 'src/metrics/entities/metric.entity';
import { CreateTelemetryPayloadDto } from 'src/telemetry-payload/dto/create-telemetry-payload.dto';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PeriodTelemetryPayloadAudit {
  constructor(createTelemetryPayload: CreateTelemetryPayloadDto) {
    Object.assign(this, createTelemetryPayload);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  telemetryHeaderId: string;

  @Column()
  assetId: string;

  /* @ManyToOne(() => Asset, (asset) => asset.periodTelemetryPayloadAudits, {})
  asset: Asset; */

  @Column({ nullable: true })
  slaveId?: string;

  @Column({ nullable: true })
  deviceId?: string;

  /* @ManyToOne(() => Device, (device) => device.periodTelemetryPayloadAudits, {
    nullable: true,
  })
  device?: Device; */

  @Column({ nullable: true })
  virtualDeviceId?: string;

  /* @ManyToOne(
    () => VirtualDevice,
    (virtualDevice) => virtualDevice.periodTelemetryPayloadAudits,
    { nullable: true },
  )
  virtualDevice?: VirtualDevice; */

  @Column(() => Metric)
  metric: Metric;

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  getTelemetryKey() {
    return (
      this.assetId +
      KEY_SEPARATOR +
      this.virtualDeviceId +
      KEY_SEPARATOR +
      this.metric?.metricsAttributeId +
      KEY_SEPARATOR +
      this.metric?.txnCapturePeriod
    );
  }
}
