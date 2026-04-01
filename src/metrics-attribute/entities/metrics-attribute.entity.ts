import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { DeviceType } from '../../device-type/entities/device-type.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import {
  CalcFrequency,
  MathOperator,
  MetricsFrequency,
  MetricType,
} from 'src/utils/enums';
import { DeviceTypeMetricsAttribute } from 'src/Asset Current Performance Source/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { getTryCatchErrorStr } from 'src/utils/others';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { MetricsAttributeFormula } from 'src/metrics-attribute-formula/entities/metrics-attribute-formula.entity';
// import { DeviceModelAttribute } from '../../device-model-attribute/entities/device-model-attribute.entity';
// import { MetricsAttributeFormula } from '../../metrics-attribute-formula/entities/metrics-attribute-formula.entity';
// import { MetricsAttributeAggregation } from '../../metrics-attribute-aggregation/entities/metrics-attribute-aggregation.entity';

// import _ from 'lodash';
// import { getTryCatchErrorStr } from '../../../utils/others';
// import { DeviceTypeMetricsAttribute } from '../../device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
// import { AssetCurrentPerformanceSource } from '../../asset-current-performance-source/entities/asset-current-performance-source.entity';
// import { KEY_SEPARATOR } from 'src/app_config/constants';
// import { RuleStore } from 'src/rule-store/entities/rule-store.entity';
// import { AssetTypeCurrentPerformanceSource } from 'src/asset-type-current-performance-source/entities/asset-type-current-performance-source.entity';

@Entity()
export class MetricsAttribute {
  constructor(metricsAttribute: Partial<MetricsAttribute>) {
    Object.assign(this, metricsAttribute);
  }
  @PrimaryColumn()
  id: string;

  @OneToMany(
    () => DeviceTypeMetricsAttribute,
    (deviceTypeMetricsAttribute) => deviceTypeMetricsAttribute.metricsAttribute,
    {
      //eager: true,
      nullable: true,
      cascade: true,
    },
  )
  deviceTypeMetricsAttributes: DeviceTypeMetricsAttribute[];

  // findFromDeviceTypeID(inputDeviceTypeID: string): boolean {
  //   try {
  //     if (_.isEmpty(this.deviceTypeMetricsAttributes)) {
  //       return false;
  //     } else {
  //       const record = this.deviceTypeMetricsAttributes.find(
  //         (deviceTypeMetricsAttribute) =>
  //           deviceTypeMetricsAttribute.deviceTypeId == inputDeviceTypeID,
  //       );
  //       return record ? true : false;
  //     }
  //   } catch (error) {
  //     const errMsg = getTryCatchErrorStr(error);
  //     throw new Error(errMsg);
  //   }
  // }

  // findDeviceType(inputDeviceType: DeviceType): boolean {
  //   try {
  //     if (_.isEmpty(this.deviceTypeMetricsAttributes)) {
  //       return false;
  //     } else {
  //       const record = this.deviceTypeMetricsAttributes.find(
  //         (deviceType) => deviceType.id == inputDeviceType.id,
  //       );
  //       return record ? true : false;
  //     }
  //   } catch (error) {
  //     const errMsg = getTryCatchErrorStr(error);
  //     throw new Error(errMsg);
  //   }
  // }

  // @OneToMany(
  //   () => MetricsAttributeAggregation,
  //   (groupMetricsAttribute) => groupMetricsAttribute.metricsAttribute,
  //   {
  //     nullable: true,
  //     cascade: true,
  //   },
  // )
  // groupMetricsAttributes?: MetricsAttributeAggregation[];

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MetricsFrequency,
    default: MetricsFrequency.INSTANT,
  })
  frequency: MetricsFrequency;

  @OneToOne(() => MetricsAttribute, { nullable: true })
  @JoinColumn()
  paramMetricsAttribute?: MetricsAttribute;

  @Column({ nullable: true })
  paramMetricsAttributeId?: string;

  @Column({ nullable: true })
  mathOperator?: MathOperator;

  @Column({ nullable: true, default: MetricType.original })
  metricType?: MetricType;

  /* @Column({ nullable: true, default: CalcFrequency.instant })
  calcFrequency?: CalcFrequency; */

  // @OneToMany(
  //   () => DeviceModelAttribute,
  //   (deviceModelAttribute) => deviceModelAttribute.metricsAttribute,
  //   {
  //     nullable: true,
  //     cascade: true,
  //   },
  // )
  // deviceModelAttributes?: DeviceModelAttribute[];

  @OneToMany(
    () => MetricsAttributeFormula,
    (deviceMetricsAttributeFormula) =>
      deviceMetricsAttributeFormula.metricsAttribute,
    {
      nullable: true,
      cascade: true,
    },
  )
  deviceMetricsAttributeFormulas?: MetricsAttributeFormula[];

  // @OneToMany(
  //   () => AssetCurrentPerformanceSource,
  //   (assetCurrentPerformanceSource) =>
  //     assetCurrentPerformanceSource.metricsAttribute,
  //   {
  //     nullable: true,
  //     cascade: true,
  //   },
  // )
  // assetCurrentPerformanceSources?: AssetCurrentPerformanceSource[];

  // @OneToMany(() => AssetTypeCurrentPerformanceSource, (aTCPS) => aTCPS.metricsAttribute, {
  //   nullable: true,
  // })
  // assetTypeCurrentPerformanceSources?: AssetTypeCurrentPerformanceSource[];

  @Column({ nullable: true })
  searchTerm: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm = this.id + KEY_SEPARATOR + (this.description ?? '');
  }

  // @OneToMany(() => RuleStore, (ruleStore) => ruleStore.metricsAttribute, {
  //   nullable: true,
  //   cascade: true,
  // })
  // rules?: RuleStore[];

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;
}
