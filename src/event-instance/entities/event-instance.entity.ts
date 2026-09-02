import { Alert } from 'src/alert/entities/alert.entity';
import { Asset } from 'src/asset/entities/asset.entity';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import { Device } from 'src/device/entities/device.entity';
import { EventType } from 'src/event-type/entities/event-type.entity';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Unique(['assetId', 'virtualDeviceId', 'eventTypeId', 'alertId', 'startTime'])
@Entity()
export class EventInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, (asset) => asset.eventInstances)
  asset: Asset;

  @Column()
  assetId: string;

  @ManyToOne(() => VirtualDevice, (vD) => vD.eventInstances, { nullable: true })
  virtualDevice?: VirtualDevice;

  @Column({ nullable: true })
  virtualDeviceId?: string;

  @ManyToOne(() => Device, (device) => device.eventInstances, {
    nullable: true,
  })
  device?: Device;

  @Column({ nullable: true })
  deviceId?: string;

  @ManyToOne(() => EventType, (eventMaster) => eventMaster.eventInstances, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  eventType: EventType;

  @Column()
  eventTypeId: string;

  @OneToOne(() => Alert, (alert) => alert.eventInstance, { nullable: true })
  @JoinColumn()
  alert?: Alert;

  @Column({ nullable: true })
  alertId?: string;

  @Column({ type: 'timestamptz' })
  startTime: Date | number;

  @Column({ type: 'timestamptz', nullable: true })
  endTime?: Date | number;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ type: 'varchar', nullable: true })
  deletedBy?: string | null;

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;
}
