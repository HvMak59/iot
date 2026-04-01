import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
// import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
// import { RoleType } from '../../../utils/enums';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { RoleType } from 'src/common';

@Entity()
export class UserRole {
  constructor(userRole?: Partial<UserRole>) {
    Object.assign(this, userRole);
  }
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setId() {
    this.id = this.getKey();
  }

  @ManyToOne(() => User, (user) => user.userRoles)
  user: User;

  @Column()
  userId: string;

  // @ManyToOne(() => Role, (role) => role.userRoles)
  // role: Role;

  @Column()
  roleId: RoleType;

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  getKey() {
    return this.userId + KEY_SEPARATOR + this.roleId;
  }
}
