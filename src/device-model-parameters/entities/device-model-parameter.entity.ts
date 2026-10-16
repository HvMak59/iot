import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { DeviceModel } from '../../device-model/entities/device-model.entity';
import { MetricsAttribute } from 'src/metrics-attribute/entities/metrics-attribute.entity';

@Entity()
@Unique(['deviceModelId', 'attribute'])
export class DeviceModelParameter {
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

    // @ManyToOne(() => MetricsAttribute, (metricsAttribute) => metricsAttribute.deviceModelParameters, {
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE',
    // })
    // @JoinColumn()
    // metricsAttribute: MetricsAttribute;

    @Column()
    attribute: string;

    // @Column()
    // name: string;

    @Column()
    registerAddress: string;

    @Column()
    registerDataType: string;

    @Column()
    registerValueType: string;

    @Column({ type: 'double precision', default: 1 })
    registerMultiplier: number;

    @Column({ default: 1 })
    registerFieldSize: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}

