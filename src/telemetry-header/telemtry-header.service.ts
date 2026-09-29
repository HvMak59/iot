// import serviceConfig from '/app_config/service.config.json';
import serviceConfig from '../app_config/service.config.json';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Between,
    In,
    IsNull,
    LessThan,
    MoreThan,
    Not,
    Repository,
} from 'typeorm';
import { close } from 'fs';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { CreatedAndClosedAlerts, KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { FindAssetDto } from 'src/asset/dto/find-asset.dto';
import { AlertGateway } from '../websocket/alert.gateway';
import { AlertStatus } from 'src/utils/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { TelemetryHeader } from './entities/telemetry-header.entity';
import { CreateTelemetryHeaderDto } from './dto/create-telemtry-header.dto';
// import { FindAssetDto } from 'asset/dto/find-asset.dto';

@Injectable()
export class TelemtryHeaderService {
    private readonly logger = winstonServerLogger(TelemtryHeaderService.name);
    constructor(
        @InjectRepository(TelemetryHeader) private readonly repo: Repository<TelemetryHeader>
    ) { }

    async create(createTelemetryHeaderDto: CreateTelemetryHeaderDto) {
        const r = this.repo.create(createTelemetryHeaderDto);
        return await this.repo.save(r);
    }
}