import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique
} from 'typeorm';

import { DeviceModel } from '../../device-model/entities/device-model.entity';
import { RegisterAccess, RegisterValueType } from 'src/utils/enums';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import { MetricsAttribute } from 'src/metrics-attribute/entities/metrics-attribute.entity';

@Entity()
@Unique(['deviceModelId', 'metricsAttributeId'])
export class DeviceModelRegister {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => DeviceModel, (deviceModel) => deviceModel.deviceModelParameters, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    deviceModel: DeviceModel;

    @Column()
    deviceModelId: string;

    @ManyToOne(() => MetricsAttribute, (m) => m.deviceModelParameters, {
        nullable: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    metricsAttribute: MetricsAttribute | null;

    @Column()
    metricsAttributeId: string;

    @Column()
    registerAddress: string;

    @Column()
    registerDataType: string;

    @Column({ type: 'enum', enum: RegisterValueType })
    registerValueType: RegisterValueType;

    @Column({ type: 'float', default: 1 })
    registerMultiplier: number;

    @Column({ default: 1 })
    registerFieldSize: number;

    @Column({ type: 'enum', enum: RegisterAccess, default: RegisterAccess.read })
    registerAccess: RegisterAccess;

    @Column(() => AuditDateTime)
    auditDateTime: AuditDateTime;

    @Column({ default: 'System' })
    createdBy: string;

    @Column({ nullable: true })
    updatedBy?: string;

    @Column({ type: 'varchar', nullable: true })
    deletedBy?: string | null;
}

