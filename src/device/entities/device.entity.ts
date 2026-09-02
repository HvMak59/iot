import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
  OneToMany,
  AfterLoad,
  BeforeInsert,
  OneToOne,
  Unique,
  Index,
  BeforeUpdate,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { DeviceModel } from '../../device-model/entities/device-model.entity';
import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { CurrentOpenAlert } from '../../current-open-alert/entities/current-open-alert.entity';
import { Alert } from '../../alert/entities/alert.entity';
// import { DeviceModelState } from '../../device-model-state/entities/device-model-state.entity';
import _ from 'lodash';
import { CurrentTelemetryPayload } from '../../current-telemetry-payload/entities/current-telemetry-payload.entity';
// import {
//   KEY_SEPARATOR,
//   REF_INSTALLATION_DAY,
//   REF_INSTALLATION_MONTH,
//   REF_INSTALLATION_YEAR,
//   RMU,
// }from 'src/app_config/constants';
import { VirtualDevice } from '../../virtual-device/entities/virtual-device.entity';
// import { Org } from '../../org/entities/org.entity';
import { TelemetryPayload } from '../../telemetry-payload/entities/telemetry-payload.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { EventInstance } from 'src/event-instance/entities/event-instance.entity';
// import { EntityState } from '../../../utils/commonModels/entity_state';

@Unique(['deviceModelId', 'serialNo'])
@Index(['clientDeviceId'], { unique: true })
@Entity()
export class Device {
  constructor(device: Device) {
    device ? Object.assign(this, device) : Object.assign(this, {});
  }
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setID() {
    this.id = this.deviceModelId + KEY_SEPARATOR + this.serialNo;
  }

  // @ManyToOne(() => Org, (org) => org.devices, {
  //   nullable: true,
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // ownerOrg: Org;

  @Column({ nullable: true })
  ownerOrgId: string;

  @Column({ nullable: true })
  virtualDeviceId?: string;

  @OneToOne(() => VirtualDevice, (virtualDevice) => virtualDevice.device, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  virtualDevice?: VirtualDevice;

  @Column()
  serialNo: string;

  @Column({ nullable: true })
  clientDeviceId?: string;

  @Column()
  deviceModelId: string;

  @ManyToOne(() => DeviceModel, (dvcMdl) => dvcMdl.devices, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  deviceModel: DeviceModel;

  /*  @Column({ nullable: true })
  assetId: string;

  @ManyToOne(() => Asset, (asset) => asset.devices, { nullable: true })
  asset: Asset; */

  @OneToMany(
    () => CurrentOpenAlert,
    (currentOpenAlert) => currentOpenAlert.device,
    { nullable: true, cascade: true },
  )
  currentOpenAlerts: CurrentOpenAlert[];

  @OneToMany(() => Alert, (alert) => alert.device, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  alerts: Alert[];

  // @ManyToOne(
  //   () => DeviceModelState,
  //   (deviceModelState) => deviceModelState.devices,
  //   {
  //     nullable: true,
  //     onDelete: 'CASCADE',
  //     onUpdate: 'CASCADE',
  //   },
  // )
  // deviceModelState: DeviceModelState;

  @Column({ nullable: true })
  deviceModelStateId?: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deviceModelStateTime?: Date;

  /*  @OneToMany(
    () => DeviceRelation,
    (deviceRelation) => deviceRelation.sourceVirtualDevice,
    { nullable: true },
  )
  deviceSourceRelations?: DeviceRelation[];

  @OneToMany(
    () => DeviceRelation,
    (deviceRelation) => deviceRelation.targetVirtualDevice,
    { nullable: true },
  )
  deviceTargetRelations?: DeviceRelation[]; */

  /*  warningCount?: number;

  faultCount?: number; */

  @OneToMany(() => CurrentTelemetryPayload, (cTP) => cTP.device, {
    nullable: true,
    cascade: true,
  })
  currentTelemetryPayloads?: CurrentTelemetryPayload[];

  @OneToMany(() => TelemetryPayload, (cTP) => cTP.device, {
    nullable: true,
    cascade: true,
  })
  telemetryPayloads?: TelemetryPayload[];

  //deviceState: DeviceState;

  // @Column(() => EntityState)
  // entityState: EntityState;

  @Column({ nullable: true })
  iMEI?: string;

  @Column({ default: false })
  validateIMEI?: boolean;

  @Column({ nullable: true })
  phoneNumber?: string;

  // isRMU(): boolean {
  //   return (
  //     this.deviceModel?.deviceTypeId === RMU ||
  //     this.deviceModel?.deviceType.id === RMU
  //   );
  // }

  isVFD(): boolean {
    return (
      this.deviceModel?.deviceTypeId === 'VFD' ||
      this.deviceModel?.deviceType.id === 'VFD'
    );
  }

  @Column({ nullable: true })
  searchTerm?: string;



  @OneToMany(() => EventInstance, (eventInstance) => eventInstance.device)
  eventInstances: EventInstance;


  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm =
      (this.virtualDeviceId ?? this.virtualDevice?.id ?? '') +
      KEY_SEPARATOR +
      this.serialNo +
      KEY_SEPARATOR +
      (this.clientDeviceId ?? '') +
      KEY_SEPARATOR +
      (this.deviceModelId ?? this.deviceModel?.id ?? '') +
      KEY_SEPARATOR +
      (this.iMEI ?? '') +
      KEY_SEPARATOR +
      (this.phoneNumber ?? '');
  }

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  // @AfterLoad()
  // @AfterInsert()
  // @AfterUpdate()
  // updateEntityState() {
  //   this.entityState = new EntityState(
  //     this.currentTelemetryPayloads,
  //     this.currentOpenAlerts,
  //     new Date(
  //       this.virtualDevice?.asset?.installationDate ??
  //         new Date(
  //           REF_INSTALLATION_YEAR - 1,
  //           REF_INSTALLATION_MONTH,
  //           REF_INSTALLATION_DAY,
  //         ),
  //     ),
  //   );
  // }
}
