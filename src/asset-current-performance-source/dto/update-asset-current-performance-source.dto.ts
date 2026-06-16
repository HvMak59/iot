import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetCurrentPerformanceSourceDto } from './create-asset-current-performance-source.dto';

export class UpdateAssetCurrentPerformanceSourceDto extends PartialType(
  CreateAssetCurrentPerformanceSourceDto,
) {
  constructor(
    updateAssetCurrentPerformanceSourceDto: UpdateAssetCurrentPerformanceSourceDto,
  ) {
    super(updateAssetCurrentPerformanceSourceDto);
    updateAssetCurrentPerformanceSourceDto
      ? Object.assign(this, updateAssetCurrentPerformanceSourceDto)
      : Object.assign(this, {});
  }
}
