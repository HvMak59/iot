import { IsIn } from 'class-validator';
import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import {
  Entity,
  Column,
  Unique,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { MetricsAttribute } from '../../metrics-attribute/entities/metrics-attribute.entity';
import { GroupMetricsAttributeAggregation } from '../../group-metrics-attribute-aggregation/entities/group-metrics-attribute-aggregation.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { AggStrategy } from 'src/utils/enums';

@Entity()
@Unique(['metricsAttributeId', 'aggregation', 'aggStrategy'])
export class MetricsAttributeAggregation {
  constructor(
    createMetricsAttributeAggregation: Partial<MetricsAttributeAggregation>,
  ) {
    let metricsAttributeAggregationToBeAssigned;
    createMetricsAttributeAggregation
      ? (metricsAttributeAggregationToBeAssigned =
        createMetricsAttributeAggregation)
      : (metricsAttributeAggregationToBeAssigned = {});
    Object.assign(this, metricsAttributeAggregationToBeAssigned);
  }
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  @BeforeUpdate()
  setID() {
    this.id = this.getKey();
  }

  @Column()
  @IsIn(['sum', 'avg'])
  aggregation: string;

  @Column()
  //@IsIn(['last', 'Within_20_Mins'])
  aggStrategy: AggStrategy;

  @Column()
  metricsAttributeId: string;

  @ManyToOne(
    () => MetricsAttribute,
    (metricsAttribute) => metricsAttribute.groupMetricsAttributes,
  )
  metricsAttribute: MetricsAttribute;

  @OneToMany(
    () => GroupMetricsAttributeAggregation,
    (groupMetricsAttributeAggregation) =>
      groupMetricsAttributeAggregation.metricsAttributeAggregation,
  )
  groupMetricsAttributeAggregations: GroupMetricsAttributeAggregation[];

  /* @Column()
  unit: string; */

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  getKey(): string {
    return `${this.metricsAttributeId}${KEY_SEPARATOR}${this.aggregation}${KEY_SEPARATOR}${this.aggStrategy}`;
  }
}
