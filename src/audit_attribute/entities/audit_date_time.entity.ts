// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterInsert,
  AfterUpdate,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
// import { convertInputToDate } from 'src/utils/others';

import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { convertInputToDate } from 'src/utils/others';
// import { convertInputToDate } from 'src/utils/other';

export class AuditDateTime {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date | number;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt?: Date | number;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | number;

  @BeforeInsert()
  @BeforeUpdate()
  convertDatesToEpochBefore() {
    const logger = winstonServerLogger(AuditDateTime.name);
    const fnName = this.convertDatesToEpochBefore.name;
    logger.debug(
      `${fnName} : createdAt ${this.createdAt}, updatedAt ${this.updatedAt}, deletedAt ${this.deletedAt}`,
    );
    this.createdAt = convertInputToDate(this.createdAt);
    if (this.updatedAt) this.updatedAt = convertInputToDate(this.updatedAt);
    if (this.deletedAt) this.deletedAt = convertInputToDate(this.deletedAt);
  }

  @AfterInsert()
  @AfterUpdate()
  @AfterLoad()
  convertDatesToEpochAfter() {
    const logger = winstonServerLogger(AuditDateTime.name);
    const fnName = this.convertDatesToEpochAfter.name;
    this.createdAt = new Date(this.createdAt).valueOf();
    if (this.updatedAt) this.updatedAt = new Date(this.updatedAt).valueOf();
    if (this.deletedAt) this.deletedAt = new Date(this.deletedAt).valueOf();
  }
}
