import { Module } from '@nestjs/common';
import { AlertMasterService } from './alert-master.service';
import { AlertMasterController } from './alert-master.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertMaster } from './entities/alert-master.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlertMaster])], // Add your entities here
  controllers: [AlertMasterController],
  providers: [AlertMasterService],
})
export class AlertMasterModule {}
