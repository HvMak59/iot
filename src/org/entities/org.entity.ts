import {
  Entity,
  Column,
  Tree,
  TreeChildren,
  TreeParent,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
// import { Asset } from '../../asset/entities/asset.entity';
// import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { validate } from 'class-validator';
import { OrgType } from 'src/utils/enums';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { Asset } from 'src/asset/entities/asset.entity';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';

//import {User} from './User';

@Entity()
@Tree('closure-table')
export class Org {
  constructor(org: Partial<Org>) {
    Object.assign(this, org);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  @BeforeUpdate()
  setHierID() {
    if (this.parent) {
      this.hierId = this.parent.hierId + '->' + this.shortId;
    } else {
      this.hierId = this.shortId;
    }
    this.setSearchTerm();
  }

  @Column({ unique: true })
  hierId: string;

  @Column()
  shortId: string;

  @Column()
  name: string;

  @Column()
  type: OrgType;

  @TreeChildren({
    cascade: ['update'],
  })
  children: Org[];

  @TreeParent()
  parent: Org;

  @Column({ nullable: true })
  parentId?: string;

  /*  @ManyToMany(() => User, (user) => user.associatedOrgs, {
    cascade: ['update'],
    onDelete: 'SET NULL',
  })
  @JoinTable()
  users: User[]; */

  @OneToMany(() => Asset, (asset) => asset.org, {
    cascade: ['update'],
    onDelete: 'SET NULL',
  })
  assets: Asset[];

  // @OneToMany(() => Device, (device) => device.ownerOrg, { nullable: true })
  // @JoinColumn({ name: 'ownerOrgId' })
  // devices: Device[];

  // @OneToMany(() => OrgUser, (orgUser) => orgUser.org)
  // orgUsers: OrgUser[];

  @Column({ nullable: true })
  searchTerm?: string;

  setSearchTerm() {
    this.searchTerm = this.name + KEY_SEPARATOR + this.hierId;
  }

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  addAsset(assetToBeAdded: Asset) {
    if (this.assets) {
      const existingAssets = this.assets.filter(
        (asset) => asset.id == assetToBeAdded.id,
      );
      if (existingAssets.length > 0) {
        return false;
      } else {
        this.assets.push(assetToBeAdded);
        return true;
      }
    } else {
      this.assets = [];
      this.assets.push(assetToBeAdded);
      return true;
    }
  }

  validateOrg() {
    return validate(this);
  }

  // @OneToMany(() => Contract, (contract) => contract.org, {
  //   nullable: true,
  //   cascade: true,
  // })
  // contracts?: Contract[];

  // @ManyToMany(() => OutgoingUrl, (outgoingUrl) => outgoingUrl.orgs, {
  //   nullable: true,
  //   cascade: true,
  // })
  // @JoinTable()
  // outgoingUrls?: OutgoingUrl[];

  @Column({ nullable: true })
  contractId?: string;
}
