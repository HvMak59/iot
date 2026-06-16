import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
// import { MetricsAttributeAdaptor } from '../../metrics-attribute-adaptor/entities/metrics-attribute-adaptor.entity';
import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { DeviceModel } from '../../device-model/entities/device-model.entity';
// import { DeviceTypeMetricsAttribute } from '../../device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { VirtualDevice } from '../../virtual-device/entities/virtual-device.entity';
// import { NoCommaValidator } from '../../../utils/no-comma.validator';
import { Validate } from 'class-validator';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { MetricsAttributeAdaptor } from 'src/metrics-attribute-adaptor/entities/metrics-attribute-adaptor.entity';
// import { KEY_SEPARATOR }from 'src/app_config/constants';

@Entity()
export class DeviceType {
  @PrimaryColumn()
  // @Validate(NoCommaValidator)
  id: string;

  @Column()
  name: string;

  @OneToMany(() => DeviceModel, (device) => device.deviceType, {
    cascade: ['update'],
    onDelete: 'SET NULL',
  })
  deviceModels: DeviceModel[];

  @OneToMany(
    () => DeviceTypeMetricsAttribute,
    (deviceTypeMetricsAttribute) => deviceTypeMetricsAttribute.deviceType,
    {
      nullable: true,
      cascade: ['update'],
      onDelete: 'SET NULL',
    },
  )
  deviceTypeMetricsAttributes: DeviceTypeMetricsAttribute[];

  @OneToMany(
    () => MetricsAttributeAdaptor,
    (attributeAdaptor) => attributeAdaptor.deviceType,
  )
  attributeAdaptors: MetricsAttributeAdaptor[];

  // @OneToMany(
  //   () => MetricsAttributeAdaptor,
  //   (attributeAdaptor) => attributeAdaptor.deviceType,
  //   {
  //     cascade: ['update'],
  //     onDelete: 'SET NULL',
  //   },
  // )
  // attributeAdaptors: MetricsAttributeAdaptor[];

  @OneToMany(() => VirtualDevice, (virtualDevice) => virtualDevice.deviceType, {
    nullable: true,
  })
  virtualDevices?: VirtualDevice[];

  @Column({ nullable: true })
  searchTerm: string;

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
