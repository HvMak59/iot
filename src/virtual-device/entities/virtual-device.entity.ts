// import { KEY_SEPARATOR }from 'src/app_config/constants';
// import { Alert } from 'src/alert/entities/alert.entity';
// import { Asset } from 'src/asset/entities/asset.entity';
// import { KEY_SEPARATOR } from 'src/app_config/constants';
import { KEY_SEPARATOR } from 'src/app_config/constants';
// import { CurrentOpenAlert } from 'src/current-open-alert/entities/current-open-alert.entity';
// import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
// // import { DeviceRelation } from 'src/device-relation/entities/device-relation.entity';
// import { Device } from 'src/device/entities/device.entity';
// import { TelemetryPayload } from 'src/telemetry-payload/entities/telemetry-payload.entity';
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    Tree,
    TreeChildren,
    TreeParent,
    Unique,
} from 'typeorm';
import { DeviceType } from 'src/device-type/entities/device-type.entity';
import { Asset } from 'src/asset/entities/asset.entity';
import { Alert } from 'src/alert/entities/alert.entity';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import { Device } from 'src/device/entities/device.entity';
import { TelemetryPayload } from 'src/telemetry-payload/entities/telemetry-payload.entity';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { CurrentOpenAlert } from 'src/current-open-alert/entities/current-open-alert.entity';
import { VirtualDeviceGroup } from 'src/virtual-device-group/entities/virtual-device-group.entity';
// import { DeviceType } from 'device-type/entities/device-t/ype.entity';
// import { Asset } from 'asset/entities/asset.entity';
// import { Alert } from 'alert/entities/alert.entity';
// import { AuditDateTime } from 'audit_attribute/entities/audit_date_time.entity';
// import { AssetCurrentPerformanceSource } from '../../asset-current-performance-source/entities/asset-current-performance-source.entity';
// import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
// import { VirtualDeviceGroup } from '../../virtual-device-group/entities/virtual-device-group.entity';
// import { DeviceType } from '../../device-type/entities/device-type.entity';

// import { Validate } from 'class-validator';
// import { NoCommaValidator } from '../../../utils/no-comma.validator';
// import { VirtualDeviceMetricsAttributeFormula } from 'src/virtual-device-metrics-attribute-formula/entities/virtual-device-metrics-attribute-formula.entity';
// import { AssetRule } from 'src/asset-rules/entities/asset-rule.entity';

@Entity()
@Tree('closure-table')
@Unique(['assetId', 'name'])
export class VirtualDevice {
    @PrimaryColumn()
    id: string;

    @BeforeInsert()
    setID() {
        if (!this.id) {
            this.id = this.assetId + KEY_SEPARATOR + this.name;
        }
    }

    @Column()
    // @Validate(NoCommaValidator)
    name: string;

    @TreeChildren()
    children: VirtualDevice[];

    @TreeParent({ onDelete: 'CASCADE' })
    parent?: VirtualDevice;

    @Column({ nullable: true })
    parentId?: string;

    @ManyToOne(() => DeviceType, (deviceType) => deviceType.virtualDevices, {
        nullable: true,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    deviceType?: DeviceType;

    @Column({ nullable: true })
    deviceTypeId?: string;

    @ManyToOne(() => Asset, (asset) => asset.virtualDevices, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    asset: Asset;

    @Column()
    assetId: string;

    @OneToOne(() => Device, (device) => device.virtualDevice, {
        nullable: true,
        cascade: true,
    })
    @JoinColumn()
    device?: Device | null;

    @Column({ nullable: true })
    deviceId?: string | null;

    @Column({ default: 1 })
    displayOrder: number;

    // @OneToMany(
    //     () => AssetCurrentPerformanceSource,
    //     (aCPS) => aCPS.virtualDevice,
    //     {
    //         nullable: true,
    //         cascade: true,
    //     },
    // )
    // assetCurrentPerformanceSources?: AssetCurrentPerformanceSource[];

    @OneToMany(() => CurrentTelemetryPayload, (cTP) => cTP.virtualDevice, {
        nullable: true,
        cascade: true,
    })
    currentTelemetryPayloads?: CurrentTelemetryPayload[];

    @OneToMany(() => TelemetryPayload, (cTP) => cTP.virtualDevice, {
        nullable: true,
        cascade: true,
    })
    telemetryPayloads?: TelemetryPayload[];

    // @OneToMany(
    //     () => DeviceRelation,
    //     (deviceRelation) => deviceRelation.sourceVirtualDevice,
    //     { nullable: true, cascade: true },
    // )
    // sourceRelations?: DeviceRelation[];

    // @OneToMany(
    //     () => DeviceRelation,
    //     (deviceRelation) => deviceRelation.targetVirtualDevice,
    //     { nullable: true, cascade: true },
    // )
    // targetRelations?: DeviceRelation[];

    @OneToMany(
        () => CurrentOpenAlert,
        (currentOpenAlert) => currentOpenAlert.virtualDevice,
        { nullable: true, cascade: true },
    )
    currentOpenAlerts?: CurrentOpenAlert[];

    @OneToMany(() => Alert, (alert) => alert.virtualDevice, {
        nullable: true,
        cascade: true,
    })
    alerts?: Alert[];

    @ManyToMany(() => Alert, (alert) => alert.affectedVirtualDevices, {
        nullable: true,
    })
    @JoinTable()
    alertsAffecting?: Alert[];

    @OneToMany(() => VirtualDeviceGroup, (vDG) => vDG.virtualDevice, {
        nullable: true,
        cascade: true,
        orphanedRowAction: 'delete',
    })
    virtualDeviceGroups?: VirtualDeviceGroup[];

    // @OneToMany(
    //     () => VirtualDeviceMetricsAttributeFormula,
    //     (vDMAF) => vDMAF.metricsAttributeFormula,
    //     { nullable: true, cascade: true },
    // )
    // metricsAttributeFormulas?: VirtualDeviceMetricsAttributeFormula[];

    /*  warningCount?: number;
  
    faultCount?: number; */

    @Column({ nullable: true })
    searchTerm?: string;

    @BeforeInsert()
    @BeforeUpdate()
    setSearchTerm() {
        this.searchTerm =
            this.name +
            KEY_SEPARATOR +
            (this.deviceTypeId ?? this.deviceType?.id) +
            KEY_SEPARATOR +
            (this.assetId ?? this.asset.id) +
            KEY_SEPARATOR +
            (this.deviceId ?? this.device?.id ?? '');
    }

    // @OneToMany(() => AssetRule, (assetRule) => assetRule.virtualDevice, {
    //     nullable: true,
    //     cascade: true,
    // })
    // alertRules?: AssetRule[];

    @Column(() => AuditDateTime)
    auditDateTime: AuditDateTime;

    @Column({ default: 'System' })
    createdBy: string;

    @Column({ nullable: true })
    updatedBy?: string;

    @Column({ nullable: true })
    deletedBy?: string;
}
