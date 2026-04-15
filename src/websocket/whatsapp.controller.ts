import { Controller, Injectable, Logger, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WhatsAppService } from './whatsapp.service';
import { AlertStatus } from 'src/utils/enums';

@Controller('whatsapp')
export class WhatsAppController {

    constructor(
        private readonly httpService: HttpService,
        private readonly whatsAppService: WhatsAppService,
    ) { }

    @Post(`send`)
    sendWhatsAppMessage() {
        // return this.whatsAppService.sendTemplateMessage('917698779298', 'Hello from NestJS!');
        return this.whatsAppService.sendMessage(
            '916353921545',
            AlertStatus.CLOSED,
            []
        );
    }
}