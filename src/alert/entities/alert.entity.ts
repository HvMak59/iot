import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
// import { Asset } from '../../asset/entities/asset.entity';
import { Device } from '../../device/entities/device.entity';
import { Validate, validate } from 'class-validator';
import { VirtualDevice } from '../../virtual-device/entities/virtual-device.entity';
import { AlertLevel, AlertType } from 'src/utils/enums';
import { Asset } from 'src/asset/entities/asset.entity';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { convertInputToDate } from 'src/utils/others';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { EventInstance } from 'src/event-instance/entities/event-instance.entity';
// import { AlertLevel, AlertType } from 'src/utils/enums';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { convertInputToDate } from 'src/utils/others';
// import { KEY_SEPARATOR } from 'src/app_config/constants';
// import { Asset } from 'asset/entities/asset.entity';
// import { KEY_SEPARATOR }from 'src/app_config/constants';

// import { NoCommaValidator } from '../../../utils/no-comma.validator';
// import { convertInputToDate } from '../../../utils/others';
// import { winstonServerLogger } from '../../../app_config/serverWinston.config';

//*Alert may not be for a specific device, however, it has to be specific to the asset */

@Unique(['virtualDeviceId', 'alertId', 'openDateTime'])
@Entity()
export class Alert {
  constructor(alert?: Partial<Alert>) {
    Object.assign(this, alert ? alert : {});
  }

  //private readonly logger = winstonServerLogger(Alert.name);

  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  //@BeforeUpdate()
  setID() {
    this.id = this.getPrimaryKey();
  }

  @Column()
  // @Validate(NoCommaValidator)
  alertId: string;

  @Column({ type: 'enum', enum: AlertType, nullable: true })
  alertType?: AlertType;

  @Column({ nullable: true })
  alertLevel?: AlertLevel;

  @ManyToOne(() => Asset, (asset) => asset.alerts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  asset: Asset;

  @Column()
  assetId: string;

  @ManyToOne(() => Device, (device) => device.alerts, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  device?: Device;

  @Column({ nullable: true })
  deviceId?: string;

  @Column({ nullable: true })
  // @Validate(NoCommaValidator)
  virtualDeviceId?: string;

  @ManyToOne(() => VirtualDevice, (virtualDevice) => virtualDevice.alerts, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  virtualDevice?: VirtualDevice;

  @Column({ nullable: true })
  sourceAttribute?: string;

  /* @ManyToOne(
    () => MetricsAttribute,
    (metricsAttribute) => metricsAttribute.alerts,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  metricsAttribute?: MetricsAttribute;

  @Column({ nullable: true })
  metricsAttributeId?: string; */

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  proposedSolution: string;

  @Column({ nullable: true })
  possibleCause: string;

  @Column({ type: 'timestamptz' })
  openDateTime: Date | number;




  @OneToOne(() => EventInstance, (eventInstance) => eventInstance.alert)
  eventInstance?: EventInstance;

  @BeforeInsert()
  setOpenDateTimeBefore() {
    const logger = winstonServerLogger(Alert.name);
    try {
      logger.debug(`Converting openDateTime to Date : ${this.openDateTime}`);
      this.openDateTime = convertInputToDate(this.openDateTime);
      logger.debug(`After conversion : ${this.openDateTime}`);
    } catch (error) {
      logger.error(
        `Error in converting openDateTime to Date : ${this.openDateTime} : ${error}`,
      );
      throw error;
    }
    /* this.openDateTime =
      typeof this.openDateTime == 'number'
        ? new Date(this.openDateTime)
        : this.openDateTime; */
  }

  @AfterInsert()
  setOpenDateTimeAfter() {
    this.openDateTime = this.openDateTime.valueOf();
  }

  @Column({ type: 'timestamptz', nullable: true })
  closeDateTime?: Date | number;

  @BeforeUpdate()
  setCloseDateTimeBefore() {
    if (this.closeDateTime == null) {
      return;
    } else {
      this.closeDateTime = convertInputToDate(this.closeDateTime);
    }
    /* this.closeDateTime = convertInputToDate(this.closeDateTime);
    this.closeDateTime =
      typeof this.closeDateTime == 'number'
        ? new Date(this.closeDateTime)
        : this.closeDateTime; */
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

  @ManyToMany(
    () => VirtualDevice,
    (virtualDevice) => virtualDevice.alertsAffecting,
    {
      nullable: true,
    },
  )
  affectedVirtualDevices?: VirtualDevice[];

  @Column({ nullable: true })
  searchTerm: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
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

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  /* @AfterLoad()
  setAuditDateTime() {
    this.auditDateTime.createdAt = this.auditDateTime.createdAt?.valueOf();
    this.auditDateTime.updatedAt = this.auditDateTime.updatedAt?.valueOf();
    this.auditDateTime.deletedAt = this.auditDateTime.deletedAt?.valueOf();
  } */

  getKey() {
    return (
      (this.assetId ?? this.asset.id) +
      KEY_SEPARATOR +
      (this.virtualDeviceId ?? this.virtualDevice?.id ?? '') +
      KEY_SEPARATOR +
      (this.sourceAttribute ?? '') +
      /*(this.metricsAttributeId ?? this.metricsAttribute?.id ?? '') +*/
      KEY_SEPARATOR +
      this.alertId
    );
  }

  getPrimaryKey() {
    return this.getKey() + KEY_SEPARATOR + new Date(this.openDateTime);
  }

  toString() {
    return `Alert ID : ${this.alertId} : Open time : ${this.openDateTime}`;
  }

  async validateAlert() {
    return await validate(this);
  }
}
