import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { DeviceModel } from '../../device-model/entities/device-model.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
// import { AlertType } from '../../../utils/enums';
// import { KEY_SEPARATOR }from 'src/app_config/constants';
// import { NoCommaValidator } from '../../../utils/no-comma.validator';
import { Validate } from 'class-validator';
import { AlertType } from 'src/utils/enums';
import { KEY_SEPARATOR } from 'src/app_config/constants';

@Entity()
export class DeviceModelAlert {
  constructor(init?: Partial<DeviceModelAlert>) {
    Object.assign(this, init);
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

  @Column()
  alertType: AlertType;

  @Column()
  message: string;

  @Column({ nullable: true })
  possibleCause: string;

  @Column({ nullable: true })
  proposedSolution: string;

  @ManyToOne(
    () => DeviceModel,
    (deviceModel) => deviceModel.deviceModelAlerts,
    { nullable: true },
  )
  deviceModel?: DeviceModel;

  @Column({ nullable: true })
  deviceModelId?: string;

  @ManyToOne(() => DeviceModel, (dM) => dM.rmuDeviceModelAlerts, {
    nullable: true,
  })
  rmuDeviceModel?: DeviceModel;

  @Column({ nullable: true })
  rmuDeviceModelId?: string;

  @Column({ nullable: true })
  searchTerm: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm =
      this.getKey() +
      KEY_SEPARATOR +
      (this.message ?? '') +
      KEY_SEPARATOR +
      (this.possibleCause ?? '') +
      KEY_SEPARATOR +
      (this.proposedSolution ?? '');
  }

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  getKey() {
    return (
      (this.deviceModelId ?? this.deviceModel?.id ?? '') +
      KEY_SEPARATOR +
      (this.rmuDeviceModelId ?? this.rmuDeviceModel?.id ?? '') +
      KEY_SEPARATOR +
      this.alertId
    );
  }
}
