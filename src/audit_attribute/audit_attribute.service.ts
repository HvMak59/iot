import { Injectable } from '@nestjs/common';
import { CreateAuditDateTimeDto } from './dto/create-audit_date_time.dto';
import { UpdateAuditDateTimeDto } from './dto/update-audit_date_time.dto';

@Injectable()
export class AuditDateTimeService {
  create(createAuditDateTimeDto: CreateAuditDateTimeDto) {
    return 'This action adds a new auditDateTime';
  }

  findAll() {
    return `This action returns all auditDateTime`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auditDateTime`;
  }

  update(id: number, updateAuditDateTimeDto: UpdateAuditDateTimeDto) {
    return `This action updates a #${id} auditDateTime`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditDateTime`;
  }
}
