import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { Response } from 'express';
import { DisplayPriority } from 'src/utils/enums';
import { getTryCatchErrorStr } from 'src/utils/others';
import { AssetCurrentPerformanceSourceService } from './asset-current-performance-source.service';
import { CreateAssetCurrentPerformanceSourceDto } from './dto/create-asset-current-performance-source.dto';
import { FindAssetCurrPerfSrcInterfaceDto } from './dto/find-asset-curr-perf-src-interface.dto';
import { FindAssetCurrentPerformanceSourceByMultipleIDs } from './dto/find-asset-current-performance-source-byMultipleIDs.dto';
//import { FindAssetCurrPerfSrcByAssetIdMainChartDto } from './dto/find-asset-current-performance-source-by-assetId-mainChart.dto';
import { FindAssetCurrentPerformanceSourceDto } from './dto/find-asset-current-performance-source.dto';
import { UpdateAssetCurrentPerformanceSourceDto } from './dto/update-asset-current-performance-source.dto';

@Controller('asset-current-performance-source')
export class AssetCurrentPerformanceSourceController {
  private readonly logger = winstonServerLogger(
    AssetCurrentPerformanceSourceController.name,
  );
  constructor(
    private readonly assetCurrentPerformanceSourceService: AssetCurrentPerformanceSourceService,
  ) { }

  @Post()
  create(
    @Body()
    createAssetCurrentPerformanceSourceDto: CreateAssetCurrentPerformanceSourceDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const fnName = 'create()';
    const input = `Input : ${JSON.stringify(
      createAssetCurrentPerformanceSourceDto,
    )}`;
    const msgTemplate = `${fnName} : ${input}`;
    try {
      this.logger.debug(`${msgTemplate} : Start`);
      return this.assetCurrentPerformanceSourceService.create(
        createAssetCurrentPerformanceSourceDto,
        response,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${msgTemplate} : End`);
    }
  }

  @Get('findByObj')
  async findByObject(
    @Query() searchCriteria: FindAssetCurrPerfSrcInterfaceDto,
  ) {
    const fnName = this.findByObject.name;
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    this.logger.info(`${fnName} : ${input}`);
    return await this.assetCurrentPerformanceSourceService.findOneByObj(
      searchCriteria,
    );
  }

  /* @Get('relations')
  findAllWthRelations(
    @Query() queryCriteria: FindAssetCurrentPerformanceSourceDto,
  ) {
    const relationsRequired = true;
    return this.assetCurrentPerformanceSourceService.findAll(
      queryCriteria,
      relationsRequired,
    );
  } */

  @Get('byMultipleIDs')
  async findByMultipleIDs(
    @Query() queryCriteria: FindAssetCurrentPerformanceSourceByMultipleIDs,
  ) {
    const fnName = 'findByMultipleIDs()';
    const input = `Input : ${JSON.stringify(queryCriteria)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      return await this.assetCurrentPerformanceSourceService.findByMultipleIDs(
        queryCriteria,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Get('nestedRelations')
  async findAllWthNestedRelations(
    @Query() queryCriteria: FindAssetCurrentPerformanceSourceDto,
  ) {
    //const relationsRequired = true;
    const fnName = 'findAllWthNestedRelations()';
    const input = `Input : ${JSON.stringify(queryCriteria)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      return await this.assetCurrentPerformanceSourceService.findAssetCurrPerfWthNestedRltns(
        queryCriteria,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Get('displayPriority')
  async findAssetCurrPerfFromDisplayPriority(
    @Query('assetID') assetID: string,
    @Query('displayPriority') displayPriority: DisplayPriority,
  ) {
    const fnName = 'findAssetCurrPerfFromDisplayPriority()';
    const input = `Input : Asset ID : ${assetID}, Display Priority : ${displayPriority.toString()}}`;
    const msgTemplate = `${fnName} : ${input}`;
    try {
      this.logger.debug(`${msgTemplate} : Start`);
      return await this.assetCurrentPerformanceSourceService.findAssetCurrPerfFromDisplayPriority(
        assetID,
        displayPriority,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${msgTemplate} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${msgTemplate} : End`);
    }
  }
  /* @Get('assetCurrPerfWithMainChart')
  getAssetCurrPerfWithMainChart(
    @Query()
    findAssetCurrentPerformanceSourceDto: FindAssetCurrentPerformanceSourceDto,
  ) {
    return this.assetCurrentPerformanceSourceService.findAssetCurrentPerformanceForMainChart(
      findAssetCurrentPerformanceSourceDto.assetId,
    );
  } */

  @Get()
  findAll(@Query() queryCriteria: FindAssetCurrentPerformanceSourceDto) {
    {
      const fnName = 'findAll()';
      const input = `Input : Query criteria : ${JSON.stringify(queryCriteria)}`;
      const msgTemplate = `${fnName} : ${input}`;
      try {
        this.logger.debug(`${msgTemplate} : Start`);
        return this.assetCurrentPerformanceSourceService.findAll(queryCriteria);
      } catch (error) {
        const errMsg = getTryCatchErrorStr(error);
        this.logger.error(`${msgTemplate} : ${errMsg}`);
        throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
      } finally {
        this.logger.debug(`${msgTemplate} : End`);
      }
    }
  }

  /* @Patch('attach-asset-type-curr-perf-src')
  attachAssetTypeCurrPerfSrc(
    @Query('assetTypeCurrPerfSrcId') assetTypeCurrPerfSrcId: string,
    @Query('assetCurrPerfSrcId') assetCurrPerfSrcId: string,
  ) {
    return this.assetCurrentPerformanceSourceService.attachAssetTypeCurrPerfSrc(
      assetTypeCurrPerfSrcId,
      assetCurrPerfSrcId,
    );
  } */

  @Patch('detach-asset-type-curr-perf-src')
  detachAssetTypeCurrPerfSrc(
    @Query('assetCurrPerfSrcId') assetCurrPerfSrcId: string,
  ) {
    return this.assetCurrentPerformanceSourceService.detachAssetTypeCurrPerfSrc(
      assetCurrPerfSrcId,
    );
  }

  @Get('findByAssetIDs')
  async findByAssetIDs(
    @Query('csvAssetIDs') csvAssetIDs: string,
    @Query('csvRelations') csvRelations: string,
  ) {
    const fnName = 'findByAssetIDs()';
    const input = `Input : csvAssetIDs : ${csvAssetIDs}, csvRelations : ${csvRelations}`;
    const msgTemplate = `${fnName} : ${input}`;
    try {
      this.logger.debug(`${msgTemplate} : Start`);
      return await this.assetCurrentPerformanceSourceService.findByAssetIDs(
        csvAssetIDs,
        csvRelations,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${msgTemplate} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${msgTemplate} : End`);
    }
  }

  @Get('capacitySrcs')
  async findCapacity(
    @Query('csvAssetIDs') csvAssetIDs: string,
    @Query('csvRelations') csvRelations: string,
  ) {
    const fnName = 'findCapacity()';
    const input = `Input : csvAssetIDs : ${csvAssetIDs}, csvRelations : ${csvRelations}`;
    const msgTemplate = `${fnName} : ${input}`;
    try {
      this.logger.debug(`${msgTemplate} : Start`);
      return await this.assetCurrentPerformanceSourceService.findCapacitySrcs(
        csvAssetIDs,
        csvRelations,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${msgTemplate} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${msgTemplate} : End`);
    }
  }

  @Get('metricsToBeCalculated')
  async findMetricsToBeCalculated() {
    const fnName = this.findMetricsToBeCalculated.name;
    this.logger.debug(`${fnName} : Start`);
    return await this.assetCurrentPerformanceSourceService.findMetricsToBeCalculated();
  }



  @Get('relations/:id')
  findOneByIdWithRelations(@Param('id') id: string) {
    return this.assetCurrentPerformanceSourceService.findOneByIdWthRelations(
      id,
    );
  }

  @Get('mainAttrib')
  async findMainAttribsByAssetIDs(@Query('csvAssetIDs') csvAssetIDs: string) {
    const fnName = this.findMainAttribsByAssetIDs.name;
    const input = `Input : csvAssetIDs : ${csvAssetIDs}`;
    this.logger.debug(`${fnName} : ${input}`);
    return await this.assetCurrentPerformanceSourceService.findMainAttribsByAssetIDs(
      csvAssetIDs,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetCurrentPerformanceSourceService.findOneById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateAssetCurrentPerformanceSourceDto: UpdateAssetCurrentPerformanceSourceDto,
  ) {
    return this.assetCurrentPerformanceSourceService.update(
      id,
      updateAssetCurrentPerformanceSourceDto,
    );
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.assetCurrentPerformanceSourceService.restore(id);
  }

  @Delete()
  remove(@Query('id') id: string) {
    return this.assetCurrentPerformanceSourceService.delete(id);
  }

  @Delete('searches')
  removeByCriteria(
    @Query() searchCriteria: FindAssetCurrentPerformanceSourceDto,
  ) {
    const fnName = 'removeByCriteria()';
    const input = `Input : searchCriteria : ${JSON.stringify(searchCriteria)}`;
    const msgTemplate = `${fnName} : ${input}`;
    try {
      this.logger.debug(`${msgTemplate} : Start`);
      return this.assetCurrentPerformanceSourceService.deleteByCriteria(
        searchCriteria,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${msgTemplate} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${msgTemplate} : End`);
    }
  }

  @Delete('softDelete/:id')
  softDelete(@Param('id') id: string) {
    return this.assetCurrentPerformanceSourceService.softDelete(id);
  }
}
