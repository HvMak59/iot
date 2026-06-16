import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, IsNull, Not, Repository } from 'typeorm';
import { Response } from 'express';
// import {
//   findAll,
//   deleteRec,
//   softDelete,
//   restore,
// } from '../../utils/cmnFn.repository';

// import serviceConfig from '../../app_config/service.config.json';

import { AssetCurrentPerformanceSource } from './entities/asset-current-performance-source.entity';
import { CreateAssetCurrentPerformanceSourceDto } from './dto/create-asset-current-performance-source.dto';
import { UpdateAssetCurrentPerformanceSourceDto } from './dto/update-asset-current-performance-source.dto';
import { FindAssetCurrentPerformanceSourceDto } from './dto/find-asset-current-performance-source.dto';
import { HttpService } from '@nestjs/axios';
import { FindAssetCurrPerfSrcInterfaceDto } from './dto/find-asset-curr-perf-src-interface.dto';
import { DisplayPriority, MetricsFrequency, MetricType } from 'src/utils/enums';
import { AssetCurrentPerformanceSourceDto } from './dto/asset-current-performance-source.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { FindAssetCurrentPerformanceSourceByMultipleIDs } from './dto/find-asset-current-performance-source-byMultipleIDs.dto';
import _ from 'lodash';
import { KEY_SEPARATOR } from 'src/app_config/constants';
//import { AssetTypeCurrentPerformanceSource } from 'src/asset_type_current_performance_source/dto/find-asset_type_current_performance_source.dto';

@Injectable()
export class AssetCurrentPerformanceSourceService {
  // private serviceName = serviceConfig.assetCurrentPerformanceSource.serviceName;
  private serviceName = '';
  private readonly logger = winstonServerLogger(
    AssetCurrentPerformanceSourceService.name,
  );
  private baseURL = process.env['BASE_URL'];
  // private eagerRelations =
  //   serviceConfig.assetCurrentPerformanceSource.eagerRelations;
  // private relations = serviceConfig.assetCurrentPerformanceSource.relations;
  // private combinedRelations = _.union(this.relations, this.eagerRelations);
  //private assetCurrPerSrcsURL = new URL('asset-current-performance-source', this.baseURL);

  constructor(
    @InjectRepository(AssetCurrentPerformanceSource)
    private readonly repo: Repository<AssetCurrentPerformanceSource>,
    private readonly httpService: HttpService,
  ) { }

  async create(
    createAssetCurrentPerformanceSourceDto: CreateAssetCurrentPerformanceSourceDto,
    response: Response,
  ) {
    const msgTemplate = 'Insert ' + this.serviceName;
    //try {
    let result;
    this.logger.debug(
      `Incoming record : ${JSON.stringify(
        createAssetCurrentPerformanceSourceDto,
      )}`,
    );
    if (createAssetCurrentPerformanceSourceDto.assetId) {
      const searchACPSObj: FindOptionsWhere<AssetCurrentPerformanceSource> = {
        assetTypeCurrentPerformanceSourceId:
          createAssetCurrentPerformanceSourceDto.assetTypeCurrentPerformanceSourceId,
        assetId: createAssetCurrentPerformanceSourceDto.assetId,
        //virtualDeviceId: createAssetCurrentPerformanceSourceDto.virtualDeviceId,
        metricsAttributeId:
          createAssetCurrentPerformanceSourceDto.metricsAttributeId,
      };
      if (createAssetCurrentPerformanceSourceDto.virtualDeviceId != null) {
        searchACPSObj.virtualDeviceId =
          createAssetCurrentPerformanceSourceDto.virtualDeviceId;
      } else if (createAssetCurrentPerformanceSourceDto.virtualDevice != null) {
        searchACPSObj.virtualDeviceId =
          createAssetCurrentPerformanceSourceDto.virtualDevice.id;
      }
      this.logger.debug(
        `${msgTemplate} : Checking for existing record with criteria : ${JSON.stringify(
          searchACPSObj,
        )}`,
      );
      result = await this.repo.findOne({
        where: searchACPSObj,
      });
      if (result) {
        this.logger.debug(`${msgTemplate} : ${result.id} already exists`);
        response.status(HttpStatus.OK); //.json(org);
      } else {
        const createAssetCurrentPerfSrcObj = this.repo.create(
          createAssetCurrentPerformanceSourceDto,
        );
        result = await this.repo.save(createAssetCurrentPerfSrcObj);
        this.logger.debug(`${msgTemplate} : ${JSON.stringify(result)} created`);
      }
      return result;
      /*  } catch (error) {
      this.logger.error(
        `${msgTemplate} : ${createAssetCurrentPerformanceSourceDto} : ${error}`,
      );
      throw new Error(error as string);
    } */
    } else {
      const errMsg = 'No assetId provided';
      this.logger.debug(`${msgTemplate} : ${errMsg}`);
      throw new Error(errMsg);
    }
  }

  /* findAll() {
    const msgTemplate = "Find " + this.serviceName + "s";
    return findAll<AssetCurrentPerformanceSource>(this.repo, msgTemplate);
    //return this.repo.find({relations: ['assetType', 'org']})
  } */

  async findOneByObj(searchCriteria: FindAssetCurrPerfSrcInterfaceDto) {
    const event = `Input : Search Criteria : ${JSON.stringify(searchCriteria)}`;
    const msgTemplate = this.serviceName + ` ${event}`;
    this.logger.debug(`${msgTemplate} : Start`);
    try {
      return await this.repo.findOne({
        where: searchCriteria,
        relations: {
          assetTypeCurrentPerformanceSource: true,
        },
      });
    } catch (error) {
    } finally {
      this.logger.debug(`${msgTemplate} : End`);
    }
  }

  // findAllWthRelations() {
  //   const msgTemplate = 'Find ' + this.serviceName + 's' + ' With relations';
  //   return findAll<AssetCurrentPerformanceSource>(
  //     this.repo,
  //     msgTemplate,
  //     serviceConfig.assetCurrentPerformanceSource.relations,
  //   );
  // }

  async findOneById(id: string) {
    const msgTemplate = 'Find ' + this.serviceName;
    try {
      return await this.repo.findOne({ where: { id: id } });
    } catch (error) {
      this.logger.error(`${msgTemplate} : ${id} : ${error}`);
      throw new Error(error as string);
    }
  }

  async findByAssetIDs(csvAssetIDs: string, csvRelations?: string) {
    const assetIDs = csvAssetIDs.split(',');
    const relations = csvRelations ? csvRelations.split(',') : [];
    const result = await this.repo.find({
      where: { assetId: In(assetIDs) },
      relations: relations,
    });
    return result.map((res) => new AssetCurrentPerformanceSourceDto(res));
  }

  async findByAssetID(assetId: string) {
    return await this.repo.find({
      select: {
        id: true,
        assetId: true,
        virtualDeviceId: true,
        virtualDevice: {
          name: true,
        },
        metricsAttributeId: true,
        assetTypeCurrentPerformanceSource: {
          label: true,
          metricsAttributeId: true,
          displayOrder: true,
          displayPriority: true,
        },
      },
      where: {
        assetId: assetId,
      },
      relations: {
        assetTypeCurrentPerformanceSource: true,
        virtualDevice: true,
      },
    });
  }

  async findCapacitySrcs(csvAssetIDs: string, csvRelations?: string) {
    const assetIDs = csvAssetIDs.split(',');
    const relations = csvRelations ? csvRelations.split(',') : [];

    const result = await this.repo.find({
      where: {
        assetId: In(assetIDs),
        /* virtualDevice: {
          assetId: In(assetIDs),
        }, */
        assetTypeCurrentPerformanceSource: {
          isCapacity: true,
        },
      },
      relations: relations,
    });
    return result.map((res) => new AssetCurrentPerformanceSourceDto(res));
  }

  findMainAttribsByAssetIDs(csvAssetIDs: string) {
    return this.repo.find({
      where: {
        assetId: In(csvAssetIDs.split(',')),
        //virtualDevice: { assetId: In(csvAssetIDs.split(',')) },
        assetTypeCurrentPerformanceSource: {
          displayPriority: DisplayPriority.FIRST,
        },
      },
      relations: {
        //metricAttribute: true,
        assetTypeCurrentPerformanceSource: true,
        virtualDevice: true,
      },
    });
  }

  async findAll(searchCriteria: FindAssetCurrentPerformanceSourceDto) {
    const searchObj: FindOptionsWhere<AssetCurrentPerformanceSource> = {
      assetId: searchCriteria.assetId,
    };
    searchCriteria.metricsAttributeId
      ? (searchObj.metricsAttributeId = searchCriteria.metricsAttributeId)
      : null;
    searchCriteria.displayPriority
      ? (searchObj.assetTypeCurrentPerformanceSource = {
        displayPriority: searchCriteria.displayPriority,
      })
      : null;

    searchCriteria.virtualDeviceId
      ? (searchObj.virtualDeviceId = searchCriteria.virtualDeviceId)
      : null;
    const result = await this.repo.find({
      where: searchObj,
      relations: {
        virtualDevice: true,
      },
    });
    return result;
    //return result.map((res) => new AssetCurrentPerformanceSourceDto(res));
  }

  async findOneByIdWthRelations(id: string) {
    const msgTemplate =
      'Find ' + this.serviceName + ' ' + id + ' With Relations';
    try {
      this.logger.debug(msgTemplate);
      return await this.repo.findOne({
        where: {
          id: id,
        },
        // relations: serviceConfig.assetCurrentPerformanceSource.relations,
      });
    } catch (error) {
      this.logger.error(`${msgTemplate} : ${id} : ${error}`);
      throw new Error(error as string);
    }
  }

  findAssetCurrPerfFromDisplayPriority(
    assetID: string,
    displayPriority: DisplayPriority,
  ) {
    return this.repo.find({
      where: {
        assetId: assetID,
        /* virtualDevice: {
          assetId: assetID,
        }, */
        assetTypeCurrentPerformanceSource: {
          displayPriority: displayPriority,
        },
      },
      relations: {
        assetTypeCurrentPerformanceSource: true,
        virtualDevice: true,
      },
    });
  }

  findByMultipleIDs(
    searchCriteria: FindAssetCurrentPerformanceSourceByMultipleIDs,
  ) {
    const searchObj = this.getSearchObjFromMultipleIDs(searchCriteria);
    return this.repo.find({
      select: {
        id: true,
        assetId: true,
        virtualDeviceId: true,
        virtualDevice: {
          deviceTypeId: true,
        },
        metricsAttributeId: true,
        assetTypeCurrentPerformanceSource: {
          label: true,
          metricsAttributeId: true,
          displayOrder: true,
          displayPriority: true,
        },
      },
      where: searchObj,
      relations: {
        assetTypeCurrentPerformanceSource: true,
        virtualDevice: true,
      },
    });
  }

  findAssetCurrPerfWthNestedRltns(
    findAssetCurrentPerformanceSourceDto: FindAssetCurrentPerformanceSourceDto,
  ) {
    const msgTemplate = this.serviceName + ' findAssetCurrPerfWthNestedRltns()';
    const event = `Query criteria : ${JSON.stringify(
      findAssetCurrentPerformanceSourceDto,
    )}`;
    //try {
    this.logger.debug(`${msgTemplate} : ${event} : Start`);
    let assetCurrPerfSrcResp;
    assetCurrPerfSrcResp = this.repo.find({
      //findAssetCurrentPerformanceSourceDto
      where: findAssetCurrentPerformanceSourceDto /* {
            assetId: findAssetCurrentPerformanceSourceDto.assetId,
          } */,
      relations: {
        assetTypeCurrentPerformanceSource: true /* {
              metricsAttributeGroup: true,
            } */,
      },
    });
    return assetCurrPerfSrcResp;
  }

  findMetricsToBeCalculated() {
    return this.repo.find({
      /* where: {
        metricAttribute: {
          //metricType: MetricType.calculated,
          //frequency: Not(MetricsFrequency.INSTANT),
          //paramMetricsAttributeId: Not(IsNull()),
          mathOperator: Not(IsNull()),
        }
      },
      relations: {
        metricAttribute: true
      } */
    });
  }

  async update(
    id: string,
    updateAssetCurrentPerformanceSourceDto: UpdateAssetCurrentPerformanceSourceDto,
  ) {
    const msgTemplate = 'Update ' + this.serviceName;
    try {
      const result = await this.repo.update(
        id,
        updateAssetCurrentPerformanceSourceDto,
      );
      if (result.affected === 0) {
        this.logger.debug(`${msgTemplate} : ${id} does not exist`);
      } else this.logger.info(`${msgTemplate} : ${id} updated `);
      return updateAssetCurrentPerformanceSourceDto;
    } catch (error) {
      this.logger.error(`${msgTemplate} ${id} : ${error}`);
      throw new Error(error as string);
    }
  }

  findByAssetId(assetId: string) {
    const fnName = this.findByAssetId.name;
    const input = `Input : assetId: ${assetId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.find({
      select: {
        assetTypeCurrentPerformanceSource: {
          label: true,
        },
        virtualDeviceId: true,
        metricsAttributeId: true,
      },
      relations: {
        assetTypeCurrentPerformanceSource: true,
      },
      where: {
        assetId: assetId,
        /* virtualDevice: {
          asset: {
            id: assetId,
          },
        }, */
      },
    });
  }

  async detachAssetTypeCurrPerfSrc(assetCurrPerfSrcId: string) {
    const msgTemplate = 'Detach asset type : ' + this.serviceName;
    try {
      this.logger.debug(
        `${msgTemplate} : Inputs : assetCurrPerfSrcId : ${assetCurrPerfSrcId}`,
      );

      const assetCurrPerfSrc = await this.repo.preload({
        id: assetCurrPerfSrcId,
      });
      this.logger.debug(
        `${msgTemplate} : Asset Curr Perf Src : ${JSON.stringify(
          assetCurrPerfSrc,
        )}`,
      );
      if (assetCurrPerfSrc) {
        await this.repo
          .createQueryBuilder()
          .relation('assetTypeCurrentPerformanceSource')
          .of(assetCurrPerfSrc)
          .set(null);
        this.logger.debug(
          `${msgTemplate} : Asset Curr Perf Src : Asset type curr perf src removed
          )}`,
        );
        return assetCurrPerfSrc;
      } else {
        const errMsg = `${msgTemplate} : Asset Curr Perf Src : not found for id ${assetCurrPerfSrcId}`;
        this.logger.error(errMsg);
        throw new Error(errMsg);
      }
    } catch (error) {
      this.logger.error(
        `${msgTemplate} : assetCurrPerfSrc : ${assetCurrPerfSrcId} : assetCurrPerfSrc : ${assetCurrPerfSrcId} : ${error}`,
      );
      throw new HttpException(
        error as String,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteByCriteria(searchString: FindAssetCurrentPerformanceSourceDto) {
    const deleteCriteria: FindOptionsWhere<AssetCurrentPerformanceSource> = {
      assetId: searchString.assetId,
      /* virtualDevice: {
        assetId: searchString.assetId,
      }, */
    };
    searchString.metricsAttributeId
      ? (deleteCriteria.metricsAttributeId = searchString.metricsAttributeId)
      : null;
    searchString.virtualDeviceId
      ? (deleteCriteria.virtualDeviceId = searchString.virtualDeviceId)
      : null;
    searchString.displayPriority
      ? (deleteCriteria.assetTypeCurrentPerformanceSource = {
        displayPriority: searchString.displayPriority,
      })
      : null;
    return this.repo.delete(searchString);
  }

  /* async attachAsset(assetCurrPerfSrc: Partial<AssetCurrentPerformanceSource>, assetID: string) {
    let msgTemplate;
    let assetCurrentPerformanceSource;
    let asset;
    try {
      msgTemplate = "Attach asset " + assetID + " to " + JSON.stringify(assetCurrPerfSrc) + " " + this.serviceName;
      assetCurrentPerformanceSource = await this.repo.preload({assetId: assetCurrPerfSrc.assetId,
      source: assetCurrPerfSrc.source, measureName: assetCurrPerfSrc.measureName});
      asset = await this.assetRepo.preload({id: assetID});
      if ( assetCurrentPerformanceSource && asset )
      {
        assetCurrentPerformanceSource.asset = asset;
        const result = await this.repo.save(assetCurrentPerformanceSource);
        if (result) {
          this.logger.debug(`${msgTemplate} completed`);
          return result;
        }
        else {
          this.logger.error(`${msgTemplate} : failed`);
        }
      }  
      else {
        const errMsg = `${msgTemplate} : ${JSON.stringify(assetCurrPerfSrc)} Asset Current Performance Source or ${assetID} asset not available`; 
        this.logger.error(errMsg);
        throw new Error(errMsg);
      }
    } catch (error) {
      this.logger.error(`${msgTemplate} ${JSON.stringify(assetCurrPerfSrc)} : ${assetID} ${error}`);
      throw new Error(error as string);
    }
  } */

  /* async detachAsset(id: string) {
    let msgTemplate;
    let assetCurrentPerformanceSource;
    try {
      msgTemplate = "Detach asset " + " from " + id + " " + this.serviceName;
      assetCurrentPerformanceSource = await this.repo.preload({id: id});
      this.logger.debug(`Device instance : ${JSON.stringify(assetCurrentPerformanceSource)}`);
      if (assetCurrentPerformanceSource)
      {
        await this.repo.createQueryBuilder().relation("asset").of(assetCurrentPerformanceSource).set(null);
        this.logger.debug(`${msgTemplate} completed`);
      }  
      else {
        const errMsg = `${msgTemplate} : ${id} not available`; 
        this.logger.error(errMsg);
        throw new Error(errMsg);
      }
    } catch (error) {
      this.logger.error(`${msgTemplate} ${JSON.stringify(assetCurrentPerformanceSource)} : ${error}`);
      throw new Error(error as string);
    }
  } */

  delete(id: string) {
    const msgTemplate = 'Delete ' + this.serviceName;
    // return deleteRec<AssetCurrentPerformanceSource>(this.repo, id, msgTemplate);
  }

  softDelete(id: string) {
    const msgTemplate = 'Soft delete ' + this.serviceName;
    // return softDelete<AssetCurrentPerformanceSource>(
    //   this.repo,
    //   id,
    //   msgTemplate,
    // );
  }

  restore(id: string) {
    const msgTemplate = 'Restore ' + this.serviceName;
    // return restore<AssetCurrentPerformanceSource>(this.repo, id, msgTemplate);
  }

  private getSearchObjFromMultipleIDs(
    searchCriteria: FindAssetCurrentPerformanceSourceByMultipleIDs,
  ) {
    const searchObj: FindOptionsWhere<AssetCurrentPerformanceSource> = {};
    searchCriteria.csvAssetIDs
      ? (searchObj.assetId = In(
        searchCriteria.csvAssetIDs.split(','),
      )) /* (searchObj.virtualDevice = {
          assetId: In(searchCriteria.csvAssetIDs.split(',')),
        }) */
      : null;
    searchCriteria.csvMetricsAttributeIDs
      ? (searchObj.metricsAttributeId = In(
        searchCriteria.csvMetricsAttributeIDs.split(','),
      ))
      : null;
    searchCriteria.csvVirtualDeviceIDs
      ? (searchObj.virtualDeviceId = In(
        searchCriteria.csvVirtualDeviceIDs.split(','),
      ))
      : null;
    return searchObj;
  }
}
