import { Module } from '@nestjs/common';
import { AlertMasterIdentifierService } from './alert-master-identifier.service';
import { AlertMasterIdentifierController } from './alert-master-identifier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertMaster } from 'src/alert-master/entities/alert-master.entity';
import { AlertMasterIdentifier } from './entities/alert-master-identifier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlertMasterIdentifier])], // Add your entities here
  controllers: [AlertMasterIdentifierController],
  providers: [AlertMasterIdentifierService],
})
export class AlertMasterIdentifierModule {}
