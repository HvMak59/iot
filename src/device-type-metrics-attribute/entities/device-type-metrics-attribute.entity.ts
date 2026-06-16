import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { DeviceType } from '../../device-type/entities/device-type.entity';
import { MetricsAttribute } from '../../metrics-attribute/entities/metrics-attribute.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { MetricsAttributeAdaptor } from '../../metrics-attribute-adaptor/entities/metrics-attribute-adaptor.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';
// import { Unit } from 'src/unit/entities/unit.entity';
// import { KEY_SEPARATOR } from '../../../app_config/constants';

@Entity()
//@Unique(['deviceTypeId', 'metricsAttributeId'])
export class DeviceTypeMetricsAttribute {
  constructor(deviceTypeMetricsAttribute: Partial<DeviceTypeMetricsAttribute>) {
    Object.assign(this, deviceTypeMetricsAttribute);
  }

  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setID() {
    this.id = this.getKey();
  }

  @ManyToOne(
    () => DeviceType,
    (deviceType) => deviceType.deviceTypeMetricsAttributes,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  deviceType: DeviceType;

  @Column()
  deviceTypeId: string;

  @ManyToOne(
    () => MetricsAttribute,
    (metricsAttribute) => metricsAttribute.deviceTypeMetricsAttributes,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  metricsAttribute: MetricsAttribute;

  @Column()
  metricsAttributeId: string;

  @OneToMany(
    () => MetricsAttributeAdaptor,
    (metricsAttributeAdaptor) =>
      metricsAttributeAdaptor.deviceTypeMetricsAttribute,
    {
      nullable: true,
      cascade: true,
    },
  )
  metricsAttributeAdaptors?: MetricsAttributeAdaptor[];

  // @ManyToOne(() => Unit, (unit) => unit.deviceTypeMetricsAttributes, {
  //   nullable: true,
  //   onUpdate: 'CASCADE',
  //   onDelete: 'CASCADE',
  // })
  // unit?: Unit;

  @Column({ nullable: true })
  unitId?: string;

  @Column({ nullable: true })
  displayOrder?: number;

  @Column({ nullable: true })
  searchTerm?: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm = this.getKey();
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
      (this.deviceTypeId ?? this.deviceType.id) +
      KEY_SEPARATOR +
      (this.metricsAttributeId ?? this.metricsAttribute.id)
    );
  }
}
