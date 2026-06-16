import { PartialType } from "@nestjs/mapped-types"
import { AssetCurrentPerformanceSource } from "../entities/asset-current-performance-source.entity"

export class CreateAssetCurrentPerformanceSourceDto extends PartialType(AssetCurrentPerformanceSource) {} 
