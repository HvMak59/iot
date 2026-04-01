import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Unique,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { DeviceManufacturer } from '../../device-manufacturer/entities/device-manufacturer.entity';
import { DeviceType } from '../../device-type/entities/device-type.entity';
import { Device } from '../../device/entities/device.entity';
import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { DeviceModelAlert } from '../../device-model-alert/entities/device-model-alert.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { AlertMasterIdentifier } from 'src/alert-master-identifier/entities/alert-master-identifier.entity';
import { MetricsAttributeAdaptor } from 'src/metrics-attribute-adaptor/entities/metrics-attribute-adaptor.entity';
import { DeviceModelMetricsAttributeFormula } from 'src/device-model-metrics-attribute-formula/entities/device-model-metrics-attribute-formula.entity';
// import { DeviceModelState } from '../../device-model-state/entities/device-model-state.entity';
// import { DeviceModelAttribute } from '../../device-model-attribute/entities/device-model-attribute.entity';
// import { DeviceModelMetricsAttributeFormula } from '../../device-model-metrics-attribute-formula/entities/device-model-metrics-attribute-formula.entity';
// import { Unit } from 'src/unit/entities/unit.entity';
// import { MetricsAttributeAdaptor } from 'src/metrics-attribute-adaptor/entities/metrics-attribute-adaptor.entity';
// import { Validate } from 'class-validator';
// import { NoCommaValidator } from '../../../utils/no-comma.validator';
// import { KEY_SEPARATOR }from 'src/app_config/constants';
// import { AlertMasterIdentifier } from 'src/alert-master-identifier/entities/alert-master-identifier.entity';

@Entity()
@Unique(['name', 'deviceManufacturerId'])
export class DeviceModel {
  constructor(deviceModel: Partial<DeviceModel>) {
    Object.assign(this, deviceModel);
  }
  @PrimaryColumn()
  // @Validate(NoCommaValidator)
  id: string;

  @BeforeInsert()
  setId() {
    this.id = this.getPrimaryKey();
  }

  getPrimaryKey(): string {
    return (
      this.deviceManufacturerId +
      KEY_SEPARATOR +
      this.deviceTypeId +
      KEY_SEPARATOR +
      this.name
    );
  }

  @OneToMany(
    () => MetricsAttributeAdaptor,
    (attributeAdaptor) => attributeAdaptor.deviceTypeMetricsAttribute,
  )
  attributeAdaptors: MetricsAttributeAdaptor[];

  @Column()
  // @Validate(NoCommaValidator)
  name: string;

  @Column()
  // @Validate(NoCommaValidator)
  deviceManufacturerId: string;

  @ManyToOne(
    () => DeviceManufacturer,
    (deviceManufacturer) => deviceManufacturer.deviceModels,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  deviceManufacturer: DeviceManufacturer;

  /* @Column({ nullable: true })
  origDeviceManufacturerId?: string;

  @ManyToOne(
    () => DeviceManufacturer,
    (deviceManufacturer) => deviceManufacturer.deviceModels,
    { nullable: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  origDeviceManufacturer?: DeviceManufacturer; */

  @OneToOne(
    () => DeviceModel,
    (deviceModel) => deviceModel.derivedDeviceModel,
    {
      nullable: true,
    },
  )
  @JoinColumn({})
  origDeviceModel?: DeviceModel;

  @OneToOne(() => DeviceModel, (dM) => dM.origDeviceModel, {
    nullable: true,
    cascade: true,
  })
  derivedDeviceModel?: DeviceModel;

  /* @Column({ nullable: true })
  origModelName: string; */

  @Column()
  deviceTypeId: string;

  @ManyToOne(() => DeviceType, (deviceType) => deviceType.deviceModels, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  deviceType: DeviceType;

  @OneToMany(() => Device, (device) => device.deviceModel, {
    nullable: true,
    cascade: true,
  })
  devices?: Device[];

  // @OneToMany(
  //   () => MetricsAttributeAdaptor,
  //   (metricsAttributeAdaptor) => metricsAttributeAdaptor.deviceModel,
  //   {
  //     cascade: true,
  //     nullable: true,
  //   },
  // )
  // attributeAdaptors?: MetricsAttributeAdaptor[];

  @Column({ nullable: true, type: 'float' })
  capacityMeasure: number;

  @Column({ nullable: true })
  capacityUnitId?: string;

  // @ManyToOne(() => Unit, (unit) => unit.assets, {
  //   nullable: true,
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // capacityUnit?: Unit;

  @OneToMany(
    () => DeviceModelAlert,
    (deviceModelAlert) => deviceModelAlert.deviceModel,
    {
      nullable: true,
      cascade: true,
    },
  )
  deviceModelAlerts?: DeviceModelAlert[];

  @OneToMany(
    () => DeviceModelAlert,
    (deviceModelAlert) => deviceModelAlert.rmuDeviceModel,
    {
      nullable: true,
      cascade: true,
    },
  )
  rmuDeviceModelAlerts?: DeviceModelAlert[];

  @ManyToMany(
    () => AlertMasterIdentifier,
    (alertMasterIdentifier) => alertMasterIdentifier.deviceModels,
    {
      nullable: true,
      cascade: true,
    },
  )
  @JoinTable()
  alertMasterIdentifiers?: AlertMasterIdentifier[];

  @OneToMany(
    () => DeviceModelMetricsAttributeFormula,
    (deviceModelDeviceModelMetricsAttributeFormula) =>
      deviceModelDeviceModelMetricsAttributeFormula.deviceModel,
    {
      nullable: true,
      cascade: true,
    },
  )
  deviceModelMetricsAttributeFormulas?: DeviceModelMetricsAttributeFormula[];

  // @OneToMany(
  //   () => DeviceModelState,
  //   (deviceModelState) => deviceModelState.deviceModel,
  //   {
  //     nullable: true,
  //     cascade: true,
  //   },
  // )
  // deviceModelStates?: DeviceModelState[];

  // @OneToMany(
  //   () => DeviceModelAttribute,
  //   (deviceModelAttribute) => deviceModelAttribute.deviceModel,
  //   {
  //     nullable: true,
  //     cascade: true,
  //   },
  // )
  // deviceModelAttributes?: DeviceModelAttribute[];

  @Column({ nullable: true })
  searchTerm: string;
  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm =
      this.id +
      KEY_SEPARATOR +
      this.name +
      KEY_SEPARATOR +
      (this.deviceManufacturerId ?? this.deviceManufacturer.id) +
      /* KEY_SEPARATOR +
      (this.origDeviceManufacturerId ?? this.origDeviceManufacturer?.id) + */
      KEY_SEPARATOR +
      (this.origDeviceModel?.id ?? '') +
      KEY_SEPARATOR +
      this.deviceTypeId;
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
