import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { OrgModule } from 'src/org/org.module';
// import { AssetService } from './asset.service';
// import { AssetController } from './asset.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Asset]),
        OrgModule
    ],
    controllers: [AssetController],
    providers: [AssetService],
    exports: [AssetService],
})
export class AssetModule { }