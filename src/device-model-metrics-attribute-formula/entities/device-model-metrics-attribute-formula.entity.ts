import { MetricsAttributeFormula } from '../../metrics-attribute-formula/entities/metrics-attribute-formula.entity';
import { DeviceModel } from '../../device-model/entities/device-model.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';

@Entity()
export class DeviceModelMetricsAttributeFormula {
  @PrimaryColumn()
  deviceModelId: string;

  @PrimaryColumn()
  metricsAttributeFormulaId: string;

  @ManyToOne(
    () => DeviceModel,
    (deviceModel) => deviceModel.deviceModelMetricsAttributeFormulas,
  )
  deviceModel: DeviceModel;

  @ManyToOne(
    () => MetricsAttributeFormula,
    (metricsAttributeFormula) =>
      metricsAttributeFormula.deviceModelMetricsAttributeFormulas,
  )
  metricsAttributeFormula: MetricsAttributeFormula;

  @Column({ nullable: true })
  searchTerm?: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm =
      (this.deviceModelId ?? this.deviceModel.id) +
      KEY_SEPARATOR +
      (this.metricsAttributeFormula?.metricsAttributeId ?? '') +
      KEY_SEPARATOR +
      (this.metricsAttributeFormula?.expression ?? '');
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
