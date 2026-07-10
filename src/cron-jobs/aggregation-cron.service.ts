import { Injectable } from "@nestjs/common";
import { winstonStandAloneLogger } from "src/app_config/serverWinston.config";
// import { AggregationService } from "./aggregation.service";
import { Cron, CronExpression } from "@nestjs/schedule";

// aggregation.cron.ts — the trigger only
@Injectable()
export class AggregationCronService {
    private readonly logger = winstonStandAloneLogger(AggregationCronService.name);
    private isRunning = false; // in-process guard; add a Redis/DB lock if multi-instance

    // constructor(private readonly aggregationService: AggregationService) { }

    //   @Cron(CronExpression.EVERY_5_MINUTES)
    async handleCron(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('Previous aggregation run still in progress — skipping this tick');
            return;
        }
        this.isRunning = true;
        try {
            // await this.aggregationService.processScheduledAggregation();
        } catch (error) {
            this.logger.error(`Aggregation cron run failed: ${error}`);
        } finally {
            this.isRunning = false;
        }
    }
}