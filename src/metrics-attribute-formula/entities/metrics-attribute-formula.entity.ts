import { Min } from 'class-validator';
import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { MetricsAttribute } from '../../metrics-attribute/entities/metrics-attribute.entity';
import _ from 'lodash';
import { DeviceModelMetricsAttributeFormula } from '../../device-model-metrics-attribute-formula/entities/device-model-metrics-attribute-formula.entity';
import { VirtualDevice } from '../../../src/virtual-device/entities/virtual-device.entity';
import { CalcFrequency } from 'src/utils/enums';

import { evaluate } from 'mathjs';

@Unique(['metricsAttributeId', 'expression', 'calculationSeq'])
@Entity()
export class MetricsAttributeFormula {
  constructor(metricsAttributeFormulaDto: Partial<MetricsAttributeFormula>) {
    let deviceMetricsAttributeFormula;
    metricsAttributeFormulaDto
      ? (deviceMetricsAttributeFormula = metricsAttributeFormulaDto)
      : (deviceMetricsAttributeFormula = {});
    Object.assign(this, deviceMetricsAttributeFormula);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  expression: string;

  @Column({ default: true })
  isCalculated: boolean;

  @Column()
  @Min(1)
  calculationSeq: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  metricsAttributeId: string;

  @ManyToOne(
    () => MetricsAttribute,
    (metricsAttribute) => metricsAttribute.deviceMetricsAttributeFormulas,
  )
  metricsAttribute: MetricsAttribute;

  @Column({ nullable: true, default: CalcFrequency.instant })
  calcFrequency: CalcFrequency;

  /* Need another table to manage many to many relationship */
  /* @ManyToMany(
    () => DeviceModel,
    (deviceModel) => deviceModel.deviceMetricsAttributeFormulas,
    {
      //eager: true,
      cascade: ['update'],
      onDelete: 'SET NULL',
    },
  )
  deviceModels: DeviceModel[]; */

  @OneToMany(
    () => DeviceModelMetricsAttributeFormula,
    (deviceModelDeviceModelMetricsAttributeFormula) =>
      deviceModelDeviceModelMetricsAttributeFormula.metricsAttributeFormula,
  )
  deviceModelMetricsAttributeFormulas: DeviceModelMetricsAttributeFormula[];

  // @OneToMany(() => VirtualDevice, (vD) => vD.metricsAttributeFormulas)
  // virtualDevices: VirtualDevice[];

  getMetricIDsFromExpression(): string[] {
    const metricIDs = this.expression.match(/[A-Za-z_][A-Za-z0-9_]*/g);
    return metricIDs ?? [];
  }

  evaluateExpression(scope: Record<string, number>): number {
    //try {
    const result = evaluate(this.expression, scope);
    return result;
    //return Number.isFinite(result) ? Number(result) : 0;
    /* } catch (err) {
        this.logger.error(`Error evaluating expression "${expression}": ${err.message}`);
        return 0;
    } */
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
