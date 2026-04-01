import { AlertLevel } from 'src/utils/enums';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { AlertMasterIdentifier } from 'src/alert-master-identifier/entities/alert-master-identifier.entity';
import { AuditDateTime } from 'src/audit_attribute/entities/audit_date_time.entity';
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';
// import { AlertLevel, AlertType } from '../../../utils/enums';

@Entity()
export class AlertMaster {
    @PrimaryColumn()
    id: string;

    @BeforeInsert()
    setId() {
        this.id = this.alertMasterIdentifierId + KEY_SEPARATOR + this.alertId;
    }

    @Column()
    alertId: string;

    @ManyToOne(() => AlertMasterIdentifier, (aMI) => aMI.alertMasterRecs)
    alertMasterIdentifier: AlertMasterIdentifier;

    @Column()
    alertMasterIdentifierId: string;

    @Column({ default: false })
    passthru: boolean;

    /* @Column({ nullable: true })
    alertType?: AlertType; */

    @Column({ nullable: true })
    alertLevel?: AlertLevel;

    @Column()
    message: string;

    @Column({ nullable: true })
    possibleCause?: string;

    @Column({ nullable: true })
    proposedSolution?: string;

    @Column()
    searchTerm: string;

    @BeforeInsert()
    @BeforeUpdate()
    setSearchTerm() {
        this.searchTerm =
            (this.alertMasterIdentifierId ?? this.alertMasterIdentifier?.id) +
            KEY_SEPARATOR +
            this.alertId +
            KEY_SEPARATOR +
            this.message +
            KEY_SEPARATOR +
            (this.possibleCause ?? '') +
            KEY_SEPARATOR +
            (this.proposedSolution ?? '');
    }

    @Column({ default: 'System' })
    createdBy: string;

    @Column({ nullable: true })
    updatedBy?: string;

    @Column({ nullable: true })
    deletedBy?: string;

    @Column(() => AuditDateTime)
    auditDateTime: AuditDateTime;
}
