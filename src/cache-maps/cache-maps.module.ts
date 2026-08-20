import { Module } from '@nestjs/common';
import { CacheMappingService } from './cache-maps.service';
import { AssetModule } from 'src/asset/asset.module';
import { CacheMappingController } from './cache-maps.controller';


@Module({
    imports: [AssetModule],
    controllers: [CacheMappingController],
    providers: [CacheMappingService],
})
export class CacheMappingModule { }
