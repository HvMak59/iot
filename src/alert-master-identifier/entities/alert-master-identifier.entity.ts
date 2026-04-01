import { AlertMaster } from 'src/alert-master/entities/alert-master.entity';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import { DeviceModel } from 'src/device-model/entities/device-model.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class AlertMasterIdentifier {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(
    () => AlertMaster,
    (alertMaster) => alertMaster.alertMasterIdentifier,
    {
      cascade: true,
      eager: true,
      nullable: true,
    },
  )
  alertMasterRecs?: AlertMaster[];

  @ManyToMany(
    () => DeviceModel,
    (deviceModel) => deviceModel.alertMasterIdentifiers,
    { nullable: true },
  )
  deviceModels?: DeviceModel[];

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  @Column(() => AuditDateTime)
  auditDateTime: AuditDateTime;
}
