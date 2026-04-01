import { PartialType } from '@nestjs/mapped-types';
import { IsIn } from 'class-validator';
import { Column } from 'typeorm';
import { TelemetryPayload } from '../../telemetry-payload/entities/telemetry-payload.entity';
import { CreateTelemetryPayloadDto } from '../../telemetry-payload/dto/create-telemetry-payload.dto';
// import { MetricsAttributeAdaptor } from '../../metrics-attribute-adaptor/entities/metrics-attribute-adaptor.entity';
import { AlertType } from 'src/utils/enums';

export class AlertFromTelemetry extends PartialType(TelemetryPayload) {
  constructor(
    createTelemetryPayloadDto: CreateTelemetryPayloadDto,
    // metricsAttributeAdaptor: MetricsAttributeAdaptor,
  ) {
    super(createTelemetryPayloadDto);
    Object.assign(this, createTelemetryPayloadDto);
    // this.alertType = metricsAttributeAdaptor.alertType;
  }
  /* @IsIn(['Warning', 'Fault'])
  @Column()
  alertType: string; */

  @Column({ type: 'enum', enum: AlertType, nullable: true })
  alertType?: AlertType;
}
