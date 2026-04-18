import { Org } from '../../org/entities/org.entity';
import { User } from '../../user/entities/user.entity';
import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
// import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';

@Entity()
export class OrgUser {
  @PrimaryColumn()
  orgId: string;

  @PrimaryColumn()
  userId: string;

  @ManyToOne(() => Org, (org) => org.orgUsers)
  org: Org;

  @ManyToOne(() => User, (user) => user.userOrgs)
  user: User;

  // @Column(() => AuditDateTime)
  // auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  @DeleteDateColumn()
  deletedAt: number;

}
