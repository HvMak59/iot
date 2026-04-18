// import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
// import { OrgUser } from '../../org-user/entities/org-user.entity';
// import { UserRole } from 'src/user-role/entities/user-role.entity';
// import { NoCommaValidator } from '../../../utils/no-comma.validator';
import { Validate } from 'class-validator';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { OrgUser } from 'src/org-user/entities/org-user.entity';

@Entity()
export class User {
  constructor(user?: Partial<User>) {
    let newUser;
    user ? (newUser = user) : (newUser = {});
    Object.assign(this, newUser);
  }

  /* @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  } */

  @PrimaryColumn()
  // @Validate(NoCommaValidator)
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  searchTerm: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm =
      this.id + KEY_SEPARATOR + this.name + KEY_SEPARATOR + (this.email ?? '');
  }

  /* @ManyToMany(() => Org, {
    nullable: true,
    cascade: ['update'],
    onDelete: 'SET NULL',
  })
  @JoinTable()
  associatedOrgs?: Org[];
 */

  @OneToMany(() => OrgUser, (orgUser) => orgUser.user)
  userOrgs: OrgUser[];

  @OneToMany(() => UserRole, (userRole) => userRole.user, { nullable: true })
  userRoles?: UserRole[];

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;
}
