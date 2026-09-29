import { Controller, Post } from "@nestjs/common";
import { EmailService } from "./email.service";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { KEY_SEPARATOR } from "src/app_config/constants";

@Controller('email')
export class EmailController {
    private readonly logger = winstonServerLogger(EmailController.name);
    constructor(
        private readonly emailService: EmailService
    ) { }


    @Post('send')
    sendEmail() {
        const fnName = this.sendEmail.name;
        const input = `Input: Send email to: $`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        this.logger.debug("Calling sendEmail service");
        // return this.emailService.sendEmail('hiten.makwana7698@gmail.com');
    }
}


