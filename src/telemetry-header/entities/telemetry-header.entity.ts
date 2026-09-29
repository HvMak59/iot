import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TelemetryHeader {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    telemetryAdaptorId?: string;

    @OneToMany(
        () => CurrentTelemetryPayload,
        (currentTelemetryPayload) =>
            currentTelemetryPayload.telemetryHeader,
    )
    currentTelemetryPayloads: CurrentTelemetryPayload[];

    @Column()
    mqttTopic: string;

    @Column({ nullable: true })
    assetId?: string;

    @Column({ nullable: true })
    messageType?: string;

    @Column()
    rmuId: string;

    @Column({ nullable: true })
    deviceId?: string;

    @Column({ nullable: true })
    clientTxnId?: string;

    @Column({ type: 'timestamptz' })
    txnSentTime: Date;

    @Column({ nullable: true })
    clientSWVer?: string;

    @Column({ nullable: true })
    clientDFVer?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
}