import { Column } from 'typeorm';

export class AuditUser {
  @Column({ default: 'system', select: false })
  createdBy: string;

  @Column({ nullable: true, select: false })
  updatedBy?: string;

  @Column({ nullable: true, select: false })
  deletedBy?: string;
}
