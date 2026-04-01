import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuditDateTimeService } from './audit_attribute.service';
import { CreateAuditDateTimeDto } from './dto/create-audit_date_time.dto';
import { UpdateAuditDateTimeDto } from './dto/update-audit_date_time.dto';

@Controller('audit-date-time')
export class AuditDateTimeController {
  constructor(private readonly auditDateTimeService: AuditDateTimeService) {}

  @Post()
  create(@Body() createAuditDateTimeDto: CreateAuditDateTimeDto) {
    return this.auditDateTimeService.create(createAuditDateTimeDto);
  }

  @Get()
  findAll() {
    return this.auditDateTimeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditDateTimeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAuditDateTimeDto: UpdateAuditDateTimeDto,
  ) {
    return this.auditDateTimeService.update(+id, updateAuditDateTimeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditDateTimeService.remove(+id);
  }
}
