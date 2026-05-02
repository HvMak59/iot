import { Group } from '../../group/entities/group.entity';
import { MetricsAttributeAggregation } from '../../metrics-attribute-aggregation/entities/metrics-attribute-aggregation.entity';
import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { AuditUser } from '../../audit_attribute/entities/audit_user.entity';

@Entity()
export class GroupMetricsAttributeAggregation {
  @PrimaryColumn()
  groupId: string;

  @PrimaryColumn()
  metricsAttributeAggregationId: string;

  @ManyToOne(() => Group, (group) => group.groupMetricsAttributeAggregations)
  group: Group;

  @ManyToOne(
    () => MetricsAttributeAggregation,
    (metricsAttributeAggreagtion) =>
      metricsAttributeAggreagtion.groupMetricsAttributeAggregations,
  )
  metricsAttributeAggregation: MetricsAttributeAggregation;

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;
}
