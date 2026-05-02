import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Asset } from 'src/asset/entities/asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    TypeOrmModule.forFeature([Asset]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule { }
