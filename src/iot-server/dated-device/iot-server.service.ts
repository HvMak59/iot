import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { IsNull } from 'typeorm';
import _ from 'lodash'
import { convertInputToDate, endOfDate, getTryCatchErrorStr, startOfDate, throwErrIfNoData } from 'src/utils/others';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { TelemetryPayloadService } from 'src/telemetry-payload/telemetry-payload.service';
import { AssetCurrentPerformanceSourceService } from 'src/asset-current-performance-source/asset-current-performance-source.service';
import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
import { FindMetricDto } from 'src/metrics/dto/find-metric.dto';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { DeviceTypeMetricsAttributeService } from 'src/device-type-metrics-attribute/device-type-metrics-attribute.service';
import { TelemetryPayloadsRepo } from 'src/telemetry-payload/entities/telemetry-payload_repo.entity';
import { CurrentTelemetryPayloadsRepo } from 'src/current-telemetry-payload/entities/current-telemetry-payloads.entity';
import { FindDeviceTypeMetricsAttributeByMultipleIDsDto } from 'src/device-type-metrics-attribute/dto/find-device-type-metrics-attribute-byMultipleIDs.dto';
import { FindCurrentTelemetryDto } from 'src/current-telemetry-payload/dto/find-current-telemetry.dto';
import { FindDevicesPerformanceTelemetryDto } from '../dto/find-devices-performance-telemetry.dto';

@Injectable()
export class IotServerService {
    private schema;
    private appServer;
    private appPort;
    private baseURL;
    private readonly logger = winstonServerLogger('iot-service');
    // private serviceName = serviceConfig.iotService.serviceName;
    private serviceName = '';
    constructor(
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
        private readonly telemetryPayloadService: TelemetryPayloadService,

        private readonly assetCurrentPerformanceSourceService: AssetCurrentPerformanceSourceService,
        private readonly deviceTypeMetricsAttributeService: DeviceTypeMetricsAttributeService,
    ) {
        this.schema = process.env['SCHEMA'];
        this.appServer = process.env['APP_SERVER'];
        this.appPort = process.env['APP_PORT'];
        this.baseURL = `${this.schema}://${this.appServer}:${this.appPort}`;
    }

    async getDatedAssetCurrentPerformanceTelemetry(
        assetId: string,
        inputDateInEpoch: number,
    ) {
        const inputDate = convertInputToDate(inputDateInEpoch);
        const fnName = this.getDatedAssetCurrentPerformanceTelemetry.name;
        this.logger.debug(
            `${fnName} : Input assetId : ${assetId}, Input date in Epoch : ${inputDateInEpoch}, Input date : ${inputDate} : Start`,
        );

        const aCPSs =
            await this.assetCurrentPerformanceSourceService.findByMultipleIDs({
                csvAssetIDs: assetId,
            });
        this.logger.debug(
            `${fnName} : No of Asset Current Performance Sources : ${aCPSs.length}`,
        );
        throwErrIfNoData<AssetCurrentPerformanceSource>(
            aCPSs,
            `No asset current performance sources for Asset ${assetId}`,
        );

        const assetCurrPerfSrcByKey = new Map<
            string,
            AssetCurrentPerformanceSource
        >();
        const findCTPLDTOs: FindCurrentTelemetryDto[] = [];
        // const partialACPSs: Partial<AssetCurrentPerformanceSource>[] = [];
        const deviceTypeIDSet = new Set<string>();

        for (const assetCurrPerfSrc of aCPSs) {
            const aCPSObj = new AssetCurrentPerformanceSource(assetCurrPerfSrc);
            if (aCPSObj.virtualDevice?.deviceTypeId) {
                deviceTypeIDSet.add(aCPSObj.virtualDevice.deviceTypeId);
            }
            const findMetricDTO: FindMetricDto = {
                metricsAttributeId: aCPSObj.metricsAttributeId,
            };
            findCTPLDTOs.push({
                assetId: aCPSObj.assetId,
                virtualDeviceId: aCPSObj.virtualDeviceId ?? IsNull(),
                metric: findMetricDTO,
            });
            // partialACPSs.push({
            //   assetId: aCPSObj.assetId,
            //   virtualDeviceId: aCPSObj.virtualDeviceId,
            //   metricsAttributeId: aCPSObj.metricsAttributeId,
            // });
            // assetCurrPerfSrcByKey.set(aCPSObj.getKey(), aCPSObj);
        }
        this.logger.debug(
            `${fnName} : No of Device type ID set : ${deviceTypeIDSet.size}`,
        );
        /* dTMAs are required to get the displayOrder */
        // let dTMAs: DeviceTypeMetricsAttribute[] = [];
        let dTMAsByKey: { [key: string]: DeviceTypeMetricsAttribute[] } = {};
        if (deviceTypeIDSet.size > 0) {
            dTMAsByKey = await this.deviceTypeMetricsAttributeService.dTMAsByByKey(
                {
                    csvDeviceTypeIDs: [...deviceTypeIDSet].join(','),
                },
                false,
                true,
            );
        }

        const cTPLsByTime =
            await this.currentTelemetryPayloadService.findByMultipleConditionsGroupByTime(
                findCTPLDTOs,
            );
        /* TODO - Here, we are checking only the first date in cTPLsByTime to decide whether to fetch telemetry from telemetry payloads or not. We need to check for all the dates in cTPLsByTime and find the max date and compare it with input date. If max date is greater than input date, then fetch telemetry from telemetry payloads, else return cTPLsByTime */
        const cTPLOnlyDate = startOfDate(
            new Date(parseInt(Object.keys(cTPLsByTime)[0])),
        );
        const startOfDateInput = startOfDate(inputDate);
        this.logger.debug(
            `${fnName} : Input date only : ${startOfDateInput} , Retrieved date only : ${cTPLOnlyDate}`,
        );
        if (cTPLOnlyDate > startOfDateInput) {
            this.logger.debug(
                `${fnName} : Retrieved date is greater than input date : ${cTPLOnlyDate} > ${startOfDateInput}`,
            );
            this.logger.debug(
                `${fnName} : Finding telemetry from Telemetry payloads`,
            );
            const tPLs =
                await this.telemetryPayloadService.findLatestTPLForATimePeriod(
                    // partialACPSs,
                    findCTPLDTOs,
                    startOfDateInput.valueOf(),
                    endOfDate(inputDate).valueOf(),
                );
            // return new TelemetryPayloadsRepo(tPLs).getCTPLDTOV3(
            //   assetCurrPerfSrcByKey,
            //   dTMAsByKey,
            // );
            return new TelemetryPayloadsRepo(tPLs).getCTPLDTOV3({
                aCPSByKey: assetCurrPerfSrcByKey,
                dTMAsByKey,
            });
        }
        else {
            this.logger.debug(
                `${fnName} : Input date is greater than or equal to retrieved date : ${startOfDateInput} => ${cTPLOnlyDate}`,
            );
            // return new CurrentTelemetryPayloadsRepo(
            //   Object.values(cTPLsByTime).flat(),
            // ).getCTPLDTOV3(assetCurrPerfSrcByKey, dTMAsByKey);

            return new CurrentTelemetryPayloadsRepo(
                Object.values(cTPLsByTime).flat(),
            ).getCTPLDTOV3({
                aCPSByKey: assetCurrPerfSrcByKey,
                dTMAsByKey,
            });
        }
    }


    // Device 

    async getDatedDeviceCurrentTelemetry(
        assetID: string,
        virtualDeviceID: string,
        deviceTypeID: string,
        inputDateInEpoch: number,
    ) {
        const fnName = this.getDatedDeviceCurrentTelemetry.name;

        const inputDate = convertInputToDate(inputDateInEpoch);

        this.logger.debug(
            `${fnName} : Asset : ${assetID}, VirtualDevice : ${virtualDeviceID}, DeviceType : ${deviceTypeID}, Date : ${inputDate}`,
        );

        const dTMAs =
            await this.getDeviceTypeMetricsAttributeByMultipleIDs(
                {
                    csvDeviceTypeIDs: deviceTypeID,
                },
                true,
            );

        if (_.isEmpty(dTMAs)) {
            this.logger.debug(`${fnName} : No DeviceTypeMetricsAttributes found`);
            return [];
        }

        const findCTPLDTOs: FindCurrentTelemetryDto[] = dTMAs.map(dTMA => ({
            assetId: assetID,
            virtualDeviceId: virtualDeviceID,
            metric: {
                metricsAttributeId: dTMA.metricsAttributeId,
            },
        }));

        const dTMAsByKey = _.groupBy(
            dTMAs,
            dTMA => new DeviceTypeMetricsAttribute(dTMA).getKey(),
        );

        const cTPLsByTime =
            await this.currentTelemetryPayloadService.findByMultipleConditionsGroupByTime(
                findCTPLDTOs,
            );

        if (_.isEmpty(cTPLsByTime)) {
            return [];
        }

        const cTPLOnlyDate = startOfDate(
            new Date(Number(Object.keys(cTPLsByTime)[0])),
        );

        const startOfDateInput = startOfDate(inputDate);

        this.logger.debug(
            `${fnName} : Input date : ${startOfDateInput}, Retrieved date : ${cTPLOnlyDate}`,
        );

        if (cTPLOnlyDate > startOfDateInput) {
            this.logger.debug(
                `${fnName} : Loading historical TelemetryPayload`,
            );

            const tPLs =
                await this.telemetryPayloadService.findLatestTPLForATimePeriod(
                    // in this function just  searchCriterias: FindCurrentTelemetryDto[], chane type of searchcriteria with this 
                    findCTPLDTOs,
                    startOfDateInput.valueOf(),
                    endOfDate(inputDate).valueOf(),
                );

            return new TelemetryPayloadsRepo(tPLs).getCTPLDTOV3({
                dTMAsByKey,
            });
        }
        else {
            this.logger.debug(
                `${fnName} : Loading CurrentTelemetryPayload`,
            );

            return new CurrentTelemetryPayloadsRepo(
                Object.values(cTPLsByTime).flat(),
            ).getCTPLDTOV3({
                dTMAsByKey,
            });
        }
    }

    private async getDeviceTypeMetricsAttributeByMultipleIDs(
        searchCriteria: FindDeviceTypeMetricsAttributeByMultipleIDsDto,
        forDisplay: boolean = false,
        //msgTemplate: string,
    ) {
        const event = `Inputs : ${JSON.stringify(searchCriteria)}`;
        const fnIdentifier =
            'getDeviceTypeMetricsAttributeByMultipleIDs()' + ' ' + event;
        try {
            this.logger.debug(`${fnIdentifier} : Start`);
            const relationsRequired = true;

            return await this.deviceTypeMetricsAttributeService.findByMultipleIDs(
                searchCriteria,
                relationsRequired,
                forDisplay,
            );
        } catch (error) {
            const errMsg = getTryCatchErrorStr(error);
            throw new Error(errMsg);
        } finally {
            this.logger.debug(`${fnIdentifier} : End`);
        }
    }




    async getDevicesPerformanceTelemetry(
        searchCriteria: FindDevicesPerformanceTelemetryDto,
    ) {
        const fnName = this.getDevicesPerformanceTelemetry.name;
        const event = `Input : Search Criteria : ${JSON.stringify(searchCriteria)}`;

        this.logger.debug(`${fnName} : ${event}`);

        try {
            const telemetryPayloads =
                await this.telemetryPayloadService.findForMultipleDevicesForATimePeriod(
                    searchCriteria,
                );

            if (_.isEmpty(telemetryPayloads)) {
                this.logger.debug(`${fnName} : No telemetry payload records found`);
                return [];
            }
            return new TelemetryPayloadsRepo(telemetryPayloads).getCTPLDTOV3({});
        } catch (error) {
            const errMsg = getTryCatchErrorStr(error);
            this.logger.error(`${fnName} : ${errMsg}`);
            throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            this.logger.debug(`${fnName} : End`);
        }
    }

}




