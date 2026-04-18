import { Module } from '@nestjs/common';
import { OrgUserService } from './org-user.service';
import { OrgUserController } from './org-user.controller';
import { OrgUser } from './entities/org-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([OrgUser])],
  controllers: [OrgUserController],
  providers: [OrgUserService],
})
export class OrgUserModule {}
