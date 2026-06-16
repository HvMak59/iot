import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AssetTypeCurrentPerformanceSource } from './entities/asset-type-current-performance-source.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AssetTypeCurrentPerformanceSource]), HttpModule],
    //   controllers: [AssetTypeCurrentPerformanceSourceController],
    //   providers: [AssetTypeCurrentPerformanceSourceService],
    //   exports: [AssetTyCurrentPerformanceSourceService]
})
export class AssetTypeCurrentPerformanceSourceModule { }
