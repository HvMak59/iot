import { Controller, Post } from "@nestjs/common";
import { CronJobsService } from "./cron-jobs.service";
import { winstonServerLogger } from "src/app_config/serverWinston.config";

@Controller('cron')
export class CronJobsController {
    private readonly logger = winstonServerLogger(CronJobsService.name);
    constructor(
        private readonly cronJobsService: CronJobsService
    ) { }

    // @Post('aggregate')
    async aggregate() {
        const fnName = this.aggregate.name;
        this.logger.debug(`${fnName}, Calling aggregation service`)
        this.cronJobsService.aggregation();
    }
}