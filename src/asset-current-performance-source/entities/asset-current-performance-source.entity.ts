import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  IsNull,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
// import { AssetTypeCurrentPerformanceSource } from '../../asset-type-current-performance-source/entities/asset-type-current-performance-source.entity';
import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { MetricsAttribute } from '../../metrics-attribute/entities/metrics-attribute.entity';
import { VirtualDevice } from '../../virtual-device/entities/virtual-device.entity';
// import { KEY_SEPARATOR } from '../../../app_config/constants';
// import { Asset } from '../../../src/asset/entities/asset.entity';
import { FlattenedFindCurrentTelemetryDto } from 'src/current-telemetry-payload/dto/flattened-find-current-telemetry.dto';
import { FindCurrentTelemetryDto } from 'src/current-telemetry-payload/dto/find-current-telemetry.dto';
import { FindMetricDto } from 'src/metrics/dto/find-metric.dto';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { AssetTypeCurrentPerformanceSource } from 'src/asset-type-current-performance-source/entities/asset-type-current-performance-source.entity';
import { Asset } from 'src/asset/entities/asset.entity';

@Entity()
/* @Index(['assetId', 'virtualDeviceId', 'metricsAttributeId'], {
  unique: true,
}) */
@Index(['assetId'])
export class AssetCurrentPerformanceSource {
  constructor(assetCurrPerfSrc: Partial<AssetCurrentPerformanceSource>) {
    assetCurrPerfSrc
      ? Object.assign(this, assetCurrPerfSrc)
      : Object.assign(this, {});
  }

  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setID() {
    if (!this.id) {
      this.id = this.getKey();
    }
  }

  /* @Column({ nullable: true })
  assetId: string;

  @ManyToOne(() => Asset, (asset) => asset.assetCurrentPerformanceSources, {
    nullable: true,
  })
  asset: Asset; */

  @ManyToOne(
    () => AssetTypeCurrentPerformanceSource,
    (assetTypeCurrentPerformanceSource) =>
      assetTypeCurrentPerformanceSource.assetCurrentPerformanceSources,
    { nullable: true },
  )
  assetTypeCurrentPerformanceSource: AssetTypeCurrentPerformanceSource;

  @Column()
  assetTypeCurrentPerformanceSourceId: string;

  @ManyToOne(() => Asset, (asset) => asset.assetCurrentPerformanceSources, {
    nullable: true,
  })
  asset?: Asset;

  @Column()
  assetId: string;

  @Column({ nullable: true })
  virtualDeviceId?: string;

  @ManyToOne(
    () => VirtualDevice,
    (virtualDevice) => virtualDevice.assetCurrentPerformanceSources,
    { nullable: true },
  )
  virtualDevice?: VirtualDevice;

  @Column()
  metricsAttributeId?: string;

  @Column({ nullable: true })
  metricAttributeId?: string;

  /* @ManyToOne(
    () => MetricsAttribute,
    (metricsAttribute) => metricsAttribute.assetCurrentPerformanceSources,
  )
  metricAttribute: MetricsAttribute; */

  @ManyToOne(
    () => MetricsAttribute,
    (metricsAttribute) => metricsAttribute.assetCurrentPerformanceSources,
  )
  metricsAttribute: MetricsAttribute;

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;
  getKey() {
    return (
      /* (this.assetTypeCurrentPerformanceSourceId ??
        this.assetTypeCurrentPerformanceSource?.id) +
      KEY_SEPARATOR + */
      (this.assetId ?? this.asset?.id) +
      KEY_SEPARATOR +
      (this.virtualDeviceId ?? this.virtualDevice?.id ?? '') +
      KEY_SEPARATOR +
      (
        this.assetTypeCurrentPerformanceSource?.metricsAttributeId ??
        this.assetTypeCurrentPerformanceSource?.metricsAttribute?.id ??
        this.metricsAttributeId ??
        this.metricsAttribute?.id ??
        '')
    );
  }
  getAttribute() {
    return this.metricsAttributeId;
  }

  /* getFlattenedFindCTPLDTO(): FlattenedFindCurrentTelemetryDto {
    const flattenedDTO: FlattenedFindCurrentTelemetryDto = {
      assetId: this.assetId,
      virtualDeviceId: this.virtualDeviceId,
      metricsAttributeId:
        this.metricsAttributeId ??
        this.metricsAttribute?.id ??
        this.assetTypeCurrentPerformanceSource.metricsAttributeId ??
        this.assetTypeCurrentPerformanceSource.metricsAttribute?.id,
    };
    return flattenedDTO;
  } */

  getFindCTPLDTO(): FindCurrentTelemetryDto {
    const findMetricDTO: FindMetricDto = {
      metricsAttributeId:
        this.metricsAttributeId ??
        this.metricsAttribute?.id ??
        // uncomment this 
        // this.assetTypeCurrentPerformanceSource.metricsAttributeId ??
        // this.assetTypeCurrentPerformanceSource.metricsAttribute?.id ??
        IsNull(),
    };
    const findCTPLDTO: FindCurrentTelemetryDto = {
      assetId: this.assetId,
      virtualDeviceId: this.virtualDeviceId,
      metric: findMetricDTO,
    };
    return findCTPLDTO;
  }
}
