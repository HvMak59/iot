import { Module } from '@nestjs/common';
import { OrgService } from './org.service';
import { OrgController } from './org.controller';
// import { Org } from '../../src/org/entities/org.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Org } from './entities/org.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Org]), HttpModule],
  controllers: [OrgController],
  providers: [OrgService],
  exports: [OrgService],
})
export class OrgModule { }
