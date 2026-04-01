import { Asset } from '../../asset/entities/asset.entity';
import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { Device } from '../../device/entities/device.entity';
import { Validate, validate } from 'class-validator';
// import { AlertLevel, AlertType } from '../../../utils/enums';
// import { VirtualDevice } from '../../virtual-device/entities/virtual-device.entity';
// import { KEY_SEPARATOR }from 'src/app_config/constants';
// import { NoCommaValidator } from '../../../utils/no-comma.validator';
import { Metric } from 'src/metrics/entities/metric.entity';
import { MetricsAttribute } from '../../metrics-attribute/entities/metrics-attribute.entity';
import { AlertLevel, AlertType } from 'src/utils/enums';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';

@Unique(['virtualDeviceId', 'alertId'])
@Entity()
export class CurrentOpenAlert {
  constructor(currentOpenAlert?: Partial<CurrentOpenAlert>) {
    Object.assign(this, currentOpenAlert ? currentOpenAlert : {});
  }

  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setID() {
    this.id = this.getKey();
  }

  @Column()
  // @Validate(NoCommaValidator)
  alertId: string;

  @Column({ type: 'enum', enum: AlertType, nullable: true })
  alertType?: AlertType;

  @Column({ nullable: true })
  alertLevel?: AlertLevel;

  @ManyToOne(() => Asset, (asset) => asset.currentOpenAlerts)
  asset: Asset;

  @Column()
  assetId: string;

  @ManyToOne(() => Device, (device) => device.currentOpenAlerts, {
    nullable: true,
  })
  device?: Device;

  @Column({ nullable: true })
  deviceId?: string;

  @Column({ nullable: true })
  virtualDeviceId?: string;

  @ManyToOne(
    () => VirtualDevice,
    (virtualDevice) => virtualDevice.currentOpenAlerts,
    { nullable: true },
  )
  virtualDevice?: VirtualDevice;

  @Column({ nullable: true })
  sourceAttribute?: string;

  /* @ManyToOne(
    () => MetricsAttribute,
    (metricsAttribute) => metricsAttribute.currentOpenAlerts,
    {
      nullable: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  metricsAttribute?: MetricsAttribute;

  @Column({ nullable: true })
  metricsAttributeId?: string; */

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  possibleCause: string;

  @Column({ nullable: true })
  proposedSolution: string;

  @Column('timestamptz')
  openDateTime: Date | number;

  @BeforeInsert()
  setOpenDateTimeBefore() {
    this.openDateTime =
      typeof this.openDateTime == 'number'
        ? new Date(this.openDateTime)
        : this.openDateTime;
  }

  @AfterInsert()
  setOpenDateTimeAfter() {
    this.openDateTime = this.openDateTime.valueOf();
  }

  @Column('timestamptz', { nullable: true })
  closeDateTime?: Date | number;

  @BeforeUpdate()
  setCloseDateTimeBefore() {
    this.closeDateTime =
      typeof this.closeDateTime == 'number'
        ? new Date(this.closeDateTime)
        : this.closeDateTime;
  }

  @AfterUpdate()
  setCloseDateTimeAfter() {
    this.closeDateTime = this.closeDateTime?.valueOf();
  }

  @AfterLoad()
  convertDateTimeToUTC() {
    this.openDateTime = this.openDateTime.valueOf();
    this.closeDateTime =
      this.closeDateTime != null ? this.closeDateTime.valueOf() : undefined;
  }

  @Column({ default: 1 })
  alertCount: number;

  @Column({ default: false })
  isRuleBased: boolean;

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  /* @AfterLoad()
  setAuditDateTime() {
    this.auditDateTime.createdAt = this.auditDateTime.createdAt?.valueOf();
    this.auditDateTime.updatedAt = this.auditDateTime.updatedAt?.valueOf();
    this.auditDateTime.deletedAt = this.auditDateTime.deletedAt?.valueOf();
  }
 */
  @Column()
  searchTerm: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    // console.log('setID called');
    // this.id = this.getKey();
    this.searchTerm =
      this.alertId +
      KEY_SEPARATOR +
      (this.assetId ?? this.asset.id) +
      KEY_SEPARATOR +
      (this.deviceId ?? this.device?.id ?? '') +
      KEY_SEPARATOR +
      (this.virtualDeviceId ?? this.virtualDevice?.id ?? '') + //this.virtualDeviceId +
      KEY_SEPARATOR +
      (this.message ?? '') +
      KEY_SEPARATOR +
      (this.proposedSolution ?? '') +
      KEY_SEPARATOR +
      (this.possibleCause ?? '');
  }

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  getKey() {
    return (
      this.assetId +
      KEY_SEPARATOR +
      (this.virtualDeviceId ?? this.virtualDevice?.id ?? '') +
      KEY_SEPARATOR +
      (this.sourceAttribute ?? '') +
      /* (this.metricsAttributeId ?? this.metricsAttribute?.id ?? '') + */
      KEY_SEPARATOR +
      this.alertId
    );
  }

  toString() {
    return `Alert ID : ${this.alertId} : Virtual device id : ${this.virtualDeviceId}`;
  }

  validateAlert() {
    return validate(this);
  }
}
