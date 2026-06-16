import { column } from "mathjs";
import { AssetCurrentPerformanceSource } from "src/asset-current-performance-source/entities/asset-current-performance-source.entity";
import { Asset } from "src/asset/entities/asset.entity";
import { MetricsAttribute } from "src/metrics-attribute/entities/metrics-attribute.entity";
import { DisplayPriority } from "src/utils/enums";
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
/* @Index(['assetId', 'virtualDeviceId', 'metricsAttributeId'], {
  unique: true,
}) */
@Index(['assetTypeId'])
export class AssetTypeCurrentPerformanceSource {
    constructor(assetCurrPerfSrc: Partial<AssetTypeCurrentPerformanceSource>) {
        assetCurrPerfSrc
            ? Object.assign(this, assetCurrPerfSrc)
            : Object.assign(this, {});
    }

    @PrimaryColumn()
    id: string;

    @Column()
    assetTypeId: string;

    @Column()
    label: string;

    @Column()
    displayPriority: DisplayPriority;

    @Column()
    displayOrder: number;

    @Column()
    metricsAttributeId: string;

    @Column()
    isCapacity: boolean;

    @OneToMany(
        () => AssetCurrentPerformanceSource,
        (assetCurrentPerformanceSource) =>
            assetCurrentPerformanceSource.assetTypeCurrentPerformanceSource,
        { nullable: true },
    )
    assetCurrentPerformanceSources: AssetTypeCurrentPerformanceSource;

    @ManyToOne(
        () => MetricsAttribute,
        (metricsAttribute) => metricsAttribute.assetCurrentPerformanceSources,
    )
    metricsAttribute: MetricsAttribute;
}
