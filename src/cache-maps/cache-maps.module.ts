import { Module } from '@nestjs/common';
import { CacheMappingService } from './cache-maps.service';
import { CacheMappingController } from './cache-maps.controller';
import { AssetModule } from 'src/asset/asset.module';


@Module({
    imports: [AssetModule],
    controllers: [CacheMappingController],
    providers: [CacheMappingService],
    exports: [CacheMappingService],
})
export class CacheMappingModule { }
