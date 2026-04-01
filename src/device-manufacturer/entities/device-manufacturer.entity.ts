import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { DeviceModel } from '../../device-model/entities/device-model.entity';
// import { KEY_SEPARATOR }from 'src/app_config/constants';
// import { NoCommaValidator } from '../../../utils/no-comma.validator';
import { Validate } from 'class-validator';
import { KEY_SEPARATOR } from 'src/app_config/constants';

@Entity()
export class DeviceManufacturer {
  @PrimaryColumn()
  // @Validate(NoCommaValidator)
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => DeviceModel, (device) => device.deviceManufacturer, {
    nullable: true,
    cascade: true,
  })
  deviceModels: DeviceModel[];

  /* @OneToMany(() => DeviceModel, (device) => device.origDeviceManufacturer, {
    nullable: true,
    cascade: true,
  })
  origDeviceManufacturerModels?: DeviceModel[]; */

  /*  @OneToMany(
    () => MetricsAttributeAdaptor,
    (metricsAttributeAdaptor) => metricsAttributeAdaptor.deviceManufacturer,
    {
      cascade: true,
      nullable: true,
    },
  )
  attributeAdaptors?: MetricsAttributeAdaptor[]; */

  @Column({ nullable: true })
  searchTerm?: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm = this.id + KEY_SEPARATOR + this.name;
  }

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;
}
