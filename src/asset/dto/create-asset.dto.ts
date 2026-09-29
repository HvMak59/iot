import { PartialType } from '@nestjs/mapped-types';
import { Asset } from '../entities/asset.entity';

export class CreateAssetDto extends PartialType(Asset) { }
