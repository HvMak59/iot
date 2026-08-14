import { Controller, Post } from "@nestjs/common";
import { CronJobsService } from "./cron-jobs.service";

@Controller('cron')
export class CronJobsController {

    constructor(
        private readonly cronJobsService: CronJobsService
    ) { }

    @Post('offlineAlert')
    async createOfflineAlert() {
        this.cronJobsService.createRmuOfflineAlert();
    }

    @Post('aggregate')
    async aggregate() {
        // this.cronJobsService.aggregation();
        this.cronJobsService.aggregation2();
    }
}