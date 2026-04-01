// import { Alert } from 'alert/entities/alert.entity';
// import { KEY_SEPARATOR } from 'src/app_config/constants';
// import { AuditDateTime } from 'audit_attribute/entities/audit_date_time.entity';
// import { CurrentOpenAlert } from 'current-open-alert/entities/current-open-alert.entity';
// import { CurrentTelemetryPayload } from 'current-telemetry-payload/entities/current-telemetry-payload.entity';
// import { TelemetryPayload } from 'telemetry-payload/entities/telemetry-payload.entity';
import { Alert } from 'src/alert/entities/alert.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import { CurrentOpenAlert } from 'src/current-open-alert/entities/current-open-alert.entity';
import { Org } from 'src/org/entities/org.entity';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
    AfterInsert,
    AfterUpdate,
    Unique,
    ManyToMany,
} from 'typeorm';
// import { VirtualDevice } from 'virtual-device/entities/virtual-device.entity';
// import { AssetType } from '../../asset-type/entities/asset-type.entity';
// import { Org } from '../../org/entities/org.entity';
// import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
// import { CurrentOpenAlert } from '../../current-open-alert/entities/current-open-alert.entity';
// import { Alert } from '../../alert/entities/alert.entity';
// import { CurrentTelemetryPayload } from '../../current-telemetry-payload/entities/current-telemetry-payload.entity';
// import _ from 'lodash';
// import { Unit } from 'src/unit/entities/unit.entity';
// import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
// import { TelemetryPayload } from '../../telemetry-payload/entities/telemetry-payload.entity';
// import { EntityState } from '../../../utils/commonModels/entity_state';
// import { District } from '../../district/entities/district.entity';
// import { Validate } from 'class-validator';
// import { NoCommaValidator } from '../../../utils/no-comma.validator';
// import { KEY_SEPARATOR, SolarAsset }from 'src/app_config/constants';
// import { OutgoingUrl } from 'src/outgoing-url/entities/outgoing-url.entity';
// import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';

@Unique(['latitude', 'longitude'])
@Entity()
export class Asset {
    constructor(asset: Partial<Asset>) {
        Object.assign(this, asset);
    }
    @PrimaryColumn()
    // @Validate(NoCommaValidator)
    id: string;

    @Column({ unique: true })
    name: string;

    @Column()
    assetTypeId: string;

    // @ManyToOne(() => AssetType, (assetType) => assetType.assets, {
    //     nullable: true,
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE',
    // })
    // assetType: AssetType;

    @Column({ nullable: true })
    orgId: string;

    @ManyToOne(() => Org, (org) => org.assets, { nullable: true })
    org: Org;

    @OneToMany(() => VirtualDevice, (virtualDevice) => virtualDevice.asset, {
        nullable: true,
        cascade: true,
    })
    virtualDevices?: VirtualDevice[];

    @OneToMany(
        () => CurrentOpenAlert,
        (currentOpenAlert) => currentOpenAlert.asset,
        { nullable: true, cascade: true },
    )
    currentOpenAlerts?: CurrentOpenAlert[];

    @OneToMany(() => Alert, (alert) => alert.asset, {
        nullable: true,
        cascade: true,
    })
    alerts?: Alert[];

    //public assetState: EntityState;

    // @OneToMany(
    //     () => CurrentTelemetryPayload,
    //     (currentTelemetryPayload) => currentTelemetryPayload.asset,
    //     { nullable: true, cascade: true /* , eager: true  */ },
    // )
    // currentTelemetryPayloads?: CurrentTelemetryPayload[];

    // @OneToMany(
    //     () => TelemetryPayload,
    //     (telemetryPayload) => telemetryPayload.asset,
    //     { nullable: true, cascade: true },
    // )
    // telemetryPayloads?: TelemetryPayload[];

    // @OneToMany(
    //     () => AssetCurrentPerformanceSource,
    //     (assetCurrentPerformanceSource) => assetCurrentPerformanceSource.asset,
    //     {
    //         nullable: true,
    //         cascade: true,
    //     },
    // )
    // assetCurrentPerformanceSources?: AssetCurrentPerformanceSource[];

    @Column({ nullable: true, type: 'float' })
    capacityMeasure: number;

    @Column({ nullable: true })
    capacityUnitId: string;

    // @ManyToOne(() => Unit, (unit) => unit.assets, {
    //     nullable: true,
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE',
    // })
    // capacityUnit: Unit;

    @Column(() => AuditDateTime)
    auditDateTime: AuditDateTime;

    equals(otherAsset: Asset): boolean {
        return this.id == otherAsset.id;
    }

    deviceCount?: number;

    // @Column(() => EntityState)
    // entityState: EntityState;

    @Column({ type: Date })
    installationDate: Date | number;

    @BeforeInsert()
    @BeforeUpdate()
    setInstallationDate() {
        if (typeof this.installationDate == 'number') {
            this.installationDate = new Date(this.installationDate);
        }
    }

    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    convertDates() {
        this.installationDate = new Date(this.installationDate).valueOf();
        if (this.auditDateTime != null) {
            if (
                this.auditDateTime.createdAt != null &&
                typeof this.auditDateTime.createdAt != 'number'
            ) {
                this.auditDateTime.createdAt = new Date(
                    this.auditDateTime.createdAt,
                ).valueOf();
            }
            if (
                this.auditDateTime.updatedAt != null &&
                typeof this.auditDateTime.updatedAt != 'number'
            ) {
                this.auditDateTime.updatedAt = new Date(
                    this.auditDateTime.updatedAt,
                ).valueOf();
            }
            if (
                this.auditDateTime.deletedAt != null &&
                typeof this.auditDateTime.deletedAt != 'number'
            ) {
                this.auditDateTime.deletedAt = new Date(
                    this.auditDateTime.deletedAt,
                ).valueOf();
            }
        }
    }

    @Column()
    address: string;

    @Column()
    zipCode: number;

    // @ManyToOne(() => District, (district) => district.assets)
    // district: District;

    @Column()
    districtId: string;

    @Column('float4', { nullable: true })
    latitude: number;

    @Column('float4', { nullable: true })
    longitude: number;

    @Column({ nullable: true })
    publishIntervalInSeconds?: number;

    /*  dynmcLatitude?: number;
  
    dynmcLongitude?: number; */

    @Column({ nullable: true })
    searchTerm: string;

    // @ManyToMany(() => OutgoingUrl, (outgoingUrl) => outgoingUrl.assets, {
    //     nullable: true,
    // })
    // outgoingUrls?: OutgoingUrl[];

    @Column({ type: Date, nullable: true })
    telemetryStartDate: Date | number | null;

    @BeforeInsert()
    @BeforeUpdate()
    setTelemetryStartDate() {
        if (
            this.telemetryStartDate != null &&
            typeof this.telemetryStartDate == 'number'
        ) {
            this.telemetryStartDate = new Date(this.telemetryStartDate);
        }
    }

    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    getTelemetryStartDate() {
        this.telemetryStartDate =
            this.telemetryStartDate == null
                ? null
                : new Date(this.telemetryStartDate).valueOf();
    }

    @BeforeInsert()
    @BeforeUpdate()
    // Added by Hiten
    setSearchTerm() {
        this.searchTerm =
            this.id +
            KEY_SEPARATOR +
            this.name +
            KEY_SEPARATOR +
            this.assetTypeId +
            KEY_SEPARATOR +
            this.address +
            KEY_SEPARATOR +
            this.zipCode
        // KEY_SEPARATOR +
        // (this.districtId ?? this.district.id ?? '');
    }

    @Column({ default: 'System' })
    createdBy: string;

    @Column({ nullable: true })
    updatedBy?: string;

    @Column({ nullable: true })
    deletedBy?: string;

    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    updateEntityState() {
        // this.entityState = new EntityState(
        //     this.currentTelemetryPayloads,
        //     this.currentOpenAlerts,
        //     new Date(this.installationDate),
        // );
    }

    @AfterLoad()
    /* @AfterInsert()
    @AfterUpdate() */
    updateDeviceCount() {
        if (this.virtualDevices) {
            this.deviceCount = this.virtualDevices.filter(
                (vD) => vD.deviceId != null,
            ).length;
        }
    }

    // isSolarAsset(): boolean {
    // return SolarAsset.has(this.assetTypeId);
    // }
}
