import { Module } from '@nestjs/common';
import { AssetCurrentPerformanceSourceService } from './asset-current-performance-source.service';
import { AssetCurrentPerformanceSourceController } from './asset-current-performance-source.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetCurrentPerformanceSource } from './entities/asset-current-performance-source.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([AssetCurrentPerformanceSource]), HttpModule],
  controllers: [AssetCurrentPerformanceSourceController],
  providers: [AssetCurrentPerformanceSourceService],
  exports: [AssetCurrentPerformanceSourceService]
})
export class AssetCurrentPerformanceSourceModule { }
