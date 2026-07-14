import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AggregationCron {

    // @Cron(CronExpression.EVERY_5_MINUTES)
    async execute() {

    }

}