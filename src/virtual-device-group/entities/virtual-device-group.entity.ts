// import { KEY_SEPARATOR } from '../../../app_config/constants';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { Group } from '../../group/entities/group.entity';
import { VirtualDevice } from '../../virtual-device/entities/virtual-device.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['virtualDeviceId', 'groupId'])
export class VirtualDeviceGroup {
  constructor(virtualDeviceGroup: Partial<VirtualDeviceGroup>) {
    Object.assign(this, virtualDeviceGroup);
  }

  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  @BeforeUpdate()
  setID() {
    this.id = this.getKey();
  }

  @ManyToOne(
    () => VirtualDevice,
    (virtualDevice) => virtualDevice.virtualDeviceGroups,
  )
  virtualDevice: VirtualDevice;

  @Column()
  virtualDeviceId: string;

  @ManyToOne(() => Group, (group) => group.virtualDeviceGroups)
  group: Group;

  @Column()
  groupId: string;

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  getKey() {
    return this.groupId + KEY_SEPARATOR + this.virtualDeviceId;
  }
}
