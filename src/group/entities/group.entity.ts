import { VirtualDeviceGroup } from '../../virtual-device-group/entities/virtual-device-group.entity';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { GroupMetricsAttributeAggregation } from '../../group-metrics-attribute-aggregation/entities/group-metrics-attribute-aggregation.entity';

@Entity()
export class Group {
  constructor(group: Partial<Group>) {
    let inputGroup;
    group ? (inputGroup = group) : (inputGroup = {});
    Object.assign(this, inputGroup);
  }

  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => VirtualDeviceGroup,
    (virtualDeviceGroup) => virtualDeviceGroup.group,
  )
  virtualDeviceGroups: VirtualDeviceGroup[];

  @OneToMany(
    () => GroupMetricsAttributeAggregation,
    (groupMetricsAttributeAggregation) =>
      groupMetricsAttributeAggregation.group,
    {
      cascade: ['update'],
      onDelete: 'SET NULL',
    },
  )
  groupMetricsAttributeAggregations: GroupMetricsAttributeAggregation[];

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;
}
