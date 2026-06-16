import { IsIn } from 'class-validator';
// import { DataModelAdaptor } from '../../data-model-adaptor/entities/data-model-adaptor.entity';
import { DeviceType } from '../../device-type/entities/device-type.entity';

import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
// import { DeviceTypeMetricsAttribute } from '../../device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { DeviceModel } from 'src/device-model/entities/device-model.entity';
import { AlertType } from 'src/utils/enums';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';


@Unique(['dataModelAdaptorId', 'deviceTypeId', 'sourceAttribute'])
@Entity()      // 
export class MetricsAttributeAdaptor {
  constructor(metricsAttributeAdaptor: MetricsAttributeAdaptor) {
    //this.id = uuidv4();
    Object.assign(this, metricsAttributeAdaptor);
  }
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  // @BeforeUpdate() 
  setID() {
    if (!this.id) {
      this.id = this.getKey();
    }
  }

  // @ManyToOne(
  //   () => DataModelAdaptor,
  //   (dataModelAdaptor) => dataModelAdaptor.metricsAttributeAdaptors,
  //   {
  //     // cascade: true,
  //     /* onDelete: 'SET NULL', */
  //   },
  // )
  // dataModelAdaptor: DataModelAdaptor;

  @Column()
  dataModelAdaptorId: string;

  @ManyToOne(() => DeviceType, (deviceType) => deviceType.attributeAdaptors, {
    cascade: ['update'],
    onDelete: 'SET NULL',
    nullable: true,
  })
  deviceType?: DeviceType;

  @Column({ nullable: true })
  deviceTypeId?: string;

  /* @ManyToOne(
    () => DeviceManufacturer,
    (deviceManufacturer) => deviceManufacturer.attributeAdaptors,
    {
      nullable: true,
    },
  )
  deviceManufacturer?: DeviceManufacturer;

  @Column({ nullable: true })
  deviceManufacturerId?: string; */

  @ManyToOne(
    () => DeviceModel,
    (deviceModel) => deviceModel.attributeAdaptors,
    {
      nullable: true,
    },
  )
  deviceModel?: DeviceModel;

  @Column({ nullable: true })
  deviceModelId?: string;

  @Column({ nullable: true })
  deviceTypeMetricsAttributeId: string;

  @ManyToOne(
    () => DeviceTypeMetricsAttribute,
    (deviceTypeMetricsAttribute) =>
      deviceTypeMetricsAttribute.metricsAttributeAdaptors,
    {
      nullable: true,
    },
  )
  deviceTypeMetricsAttribute?: DeviceTypeMetricsAttribute;

  @Column()
  sourceAttribute: string;

  /* @Column({ default: 'Normal' })
  @IsIn(['Normal', 'Fault', 'Warning'])
  attributeType: string; */

  @Column({ type: 'enum', enum: AlertType, nullable: true })
  alertType?: AlertType;

  isAlert() {
    return this.alertType !== null;
  }

  @Column({ default: true })
  isActive: boolean;

  // @Column(() => AuditDateTime)
  // auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  @DeleteDateColumn()
  deletedAt?: number;

  @Column({ nullable: true })
  searchTerm: string;

  @BeforeInsert()
  // @BeforeUpdate()  
  setSearchTerm() {
    this.searchTerm = this.id;
  }

  getKey() {
    const deviceModelId = this.deviceModelId ? this.deviceModel?.id : '';
    // return `${this.dataModelAdaptorId}${KEY_SEPARATOR}${this.deviceTypeId}${KEY_SEPARATOR}${deviceModelId}${KEY_SEPARATOR}${this.sourceAttribute}`;
    return this.dataModelAdaptorId + KEY_SEPARATOR + this.deviceTypeId + KEY_SEPARATOR + deviceModelId + KEY_SEPARATOR + this.sourceAttribute;
  }
}




