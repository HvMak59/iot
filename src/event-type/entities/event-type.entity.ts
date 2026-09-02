import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import { EventInstance } from 'src/event-instance/entities/event-instance.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Unique(['name'])
@Entity()
export class EventType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => EventInstance, (eventInstance) => eventInstance.eventType, {
    nullable: true
  })
  eventInstances?: EventInstance[];

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ type: 'varchar', nullable: true })
  deletedBy?: string | null;

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;
}
