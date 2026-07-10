import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { GatewayService } from './gateway.service';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
// import {
//   CreateCurrTelemetryEvent,
//   CurrTelemetryCreatedForAssetEvent,
// } from 'src/app_config/constants';
import { OnEvent } from '@nestjs/event-emitter';
import _ from 'lodash';
import { CurrentTelemetryPayloadsRepo } from 'src/current-telemetry-payload/entities/current-telemetry-payloads.entity';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { AssetCurrentPerformanceSourceService } from 'src/asset-current-performance-source/asset-current-performance-source.service';
import { AssetCurrentPerformanceSourceRepo } from 'src/asset-current-performance-source/entities/asset-current-performance-source-repo.entity';
import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { DeviceTypeMetricsAttributeService } from 'src/device-type-metrics-attribute/device-type-metrics-attribute.service';

@WebSocketGateway({ namespace: '/ctpl', cors: { origin: '*' } })
export class GatewayGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = winstonServerLogger(GatewayGateway.name);

  private socketById: Map<string, Socket> = new Map();
  private assetIdBySocketId: Map<string, string> = new Map();
  private socketIdByAssetId: Map<string, string> = new Map();
  //private baseURL: string;
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly cTPLService: CurrentTelemetryPayloadService,
    private readonly aCPSService: AssetCurrentPerformanceSourceService,
    private readonly deviceTypeMetricsAttributeService: DeviceTypeMetricsAttributeService,
  ) {
    /* const schema = process.env['SCHEMA'];
    const appServer = process.env['APP_SERVER'];
    const appPort = process.env['APP_PORT'];
    this.baseURL = `${schema}://${appServer}:${appPort}`; */
  }

  onModuleInit() {
    this.server.on('connection', (socket) => {
      this.logger.info(`Client connected: ${socket.id}`);
      socket.on('disconnect', () => {
        const assetId = this.assetIdBySocketId.get(socket.id);
        if (assetId) {
          this.socketIdByAssetId.delete(assetId);
        }
        this.assetIdBySocketId.delete(socket.id);
        this.socketById.delete(socket.id);
        this.logger.info(`Client disconnected: ${socket.id}`);
      });
      return socket;
    });
  }

  /* @SubscribeMessage('telemetryHistory')
  async sendTelemetryHistory(
    @MessageBody() telemetryPayloadReq: TelemetryPayloadReqDto,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    this.logger.info(
      'Received telemetry history request 4 : ' +
        JSON.stringify(telemetryPayloadReq) +
        ' from client: ' +
        clientSocket.id,
    );

    const telemetryURL = new URL(
      TELEMETRY_PAYLOAD_FOR_A_TIME_PERIOD_URL,
      this.baseURL,
    );
    for (const [key, value] of Object.entries(telemetryPayloadReq)) {
      telemetryURL.searchParams.append(key, value.toString());
    }
    this.logger.info(`Constructed telemetry URL : ${telemetryURL.href}`);

    const searchObject: FindTelemetryPayloadForAPeriod =
      new FindTelemetryPayloadForAPeriod({
        assetId: telemetryPayloadReq.assetId,
        virtualDeviceId: telemetryPayloadReq.virtualDeviceId,
        metricsAttributeId: telemetryPayloadReq.metricsAttributeId,
        startTime: telemetryPayloadReq.startTime,
        endTime: telemetryPayloadReq.endTime,
      });

    const telemetryPayloads =
      await this.telemetryPayloadService.findForATimePeriod(searchObject);

    this.logger.info(
      `Received ${
        telemetryPayloads.length
      } telemetry payloads from telemetry service : ${JSON.stringify(
        telemetryPayloads,
      )}`,
    );

    let telemetryPayloadDto: TelemetryPayloadDto;

    if (telemetryPayloads.length === 0) {
      this.logger.warn(
        `No telemetry payloads found for the given request : ${JSON.stringify(
          telemetryPayloadReq,
        )}`,
      );
      const telemetryDevice: TelemetryDevice = {
        assetId: telemetryPayloadReq.assetId,
        virtualDeviceId: telemetryPayloadReq.virtualDeviceId,
        id: telemetryPayloadReq.deviceId,
      };
      const telemetryDisplayProperty: TelemetryDisplayProperty = {
        metricsAttributeId: searchObject.metricsAttributeId,
        frequency: telemetryPayloadReq.frequency ?? MetricsFrequency.INSTANT,
        displayName: searchObject.metricsAttributeId, // can be updated to a more user friendly name if available
      };
      telemetryPayloadDto = {
        telemetryDevice,
        telemetryDisplayProperty,
        metrics: [],
      };
    } else {
      const telemetryPayloadsRepo = new TelemetryPayloadsRepo(
        telemetryPayloads,
      );
      telemetryPayloadDto = telemetryPayloadsRepo.createTelemetryPayloadDto();
    }
    clientSocket.emit('telemetryHistoryResp', telemetryPayloadDto);
    this.logger.debug(
      `Emitted telemetry history response to client ${clientSocket.id}`,
    );
    const telemetryPayloadReqWithSocketDto =
      new TelemetryPayloadReqWithSocketDto({
        ...telemetryPayloadReq,
        socket: clientSocket,
      });
    this.eventEmitter.emit(TelemetryPayloadRequestEvent, {
      telemetryPayloadReqWithSocketDto,
    });
    return;
    //return this.gatewayService.create(telemetryPayloadReq);
  } */

  @SubscribeMessage('NewAssetCTPLReq')
  async newCTPLReq(
    @MessageBody() assetId: string,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const fnName = this.newCTPLReq.name;
    try {
      this.logger.info(
        `${fnName} Received new CTPL request for assetId ${assetId} from client ${clientSocket.id}`,
      );
      this.assetIdBySocketId.set(clientSocket.id, assetId);
      this.socketIdByAssetId.set(assetId, clientSocket.id);
      this.socketById.set(clientSocket.id, clientSocket);

      return;
    } catch (error) {
      this.logger.error(
        `${fnName} : Error occurred while processing CTPL request {req}: ${error}`,
      );
      throw new Error(`Invalid request format: ${error}`);
    }
    //return this.gatewayService.create(telemetryPayloadReq);
  }


  // Test from here 
  // @OnEvent(CurrTelemetryCreatedForAssetEvent)
  async sendCTPLForAssetToWebSocket(assetId: string) {
    const fnName = this.sendCTPLForAssetToWebSocket.name;
    this.logger.info(
      `${fnName} Received event for current telemetry created for asset ${assetId}`,
    );

    const socketId = this.socketIdByAssetId.get(assetId);
    if (_.isNil(socketId)) {
      this.logger.warn(
        `${fnName} No socket found for asset ${assetId}, skipping sending CTPL`,
      );
      return;
    }
    const socket = this.socketById.get(socketId);
    if (_.isNil(socket)) {
      this.logger.warn(
        `${fnName} No socket found for socket id ${socketId}, skipping sending CTPL for asset ${assetId}`,
      );
      return;
    }

    const aCPSs = await this.aCPSService.findByAssetID(assetId);
    let assetCurrPerfSrcByKey: Map<string, AssetCurrentPerformanceSource> =
      new Map();
    const deviceTypeIDSet: Set<string> = new Set();
    if (_.isNil(aCPSs)) {
      this.logger.warn(
        `${fnName} No ACPS found for asset ${assetId}, skipping sending CTPL`,
      );
      return;
    } else {
      this.logger.debug(
        `${fnName} Found ${aCPSs.length} ACPS for asset ${assetId}`,
      );
      for (const aCPS of aCPSs) {
        const aCPSObj = new AssetCurrentPerformanceSource(aCPS);
        assetCurrPerfSrcByKey.set(aCPSObj.getKey(), aCPSObj);
        if (aCPSObj.virtualDevice?.deviceTypeId) {
          deviceTypeIDSet.add(aCPSObj.virtualDevice.deviceTypeId);
        }
      }
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

      const aCPSRepo = new AssetCurrentPerformanceSourceRepo(aCPSs);
      const findCTPLDTOs = aCPSRepo.getFindCTPLDTOs();
      const cTPLs = await this.cTPLService.findByMultipleConditions(
        findCTPLDTOs,
      );
      // const cTPLDTOsV3 = new CurrentTelemetryPayloadsRepo(cTPLs).getCTPLDTOV3(
      //   assetCurrPerfSrcByKey,
      // dTMAsByKey,
      // );
      // socket.emit('newCTPLs', cTPLDTOsV3);
      this.logger.debug(
        `${fnName} Emitted new CTPLs for asset ${assetId} to socket ${socketId}`,
      );
    }
  }

  /* @SubscribeMessage('newTickTelemetry')
  async handleEvent(
    @MessageBody() telemetryPayloadReq: TelemetryPayloadReqDto,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const tPLReqJSON = JSON.parse(telemetryPayloadReq.toString());
    this.logger.debug(
      `telemetryPayloadReq JSON : ${JSON.stringify(tPLReqJSON)}`,
    );
    const tPLReqObj = new TelemetryPayloadReqDto(tPLReqJSON);
    this.logger.debug(
      `Storing mapping between socket ${
        clientSocket.id
      } and telemetry payload request ${tPLReqObj.getKey()}`,
    );
    this.tPLReqBySocketId.set(clientSocket.id, tPLReqObj.getKey());
    this.socketIdByTPLReq.set(tPLReqObj.getKey(), clientSocket.id);
    this.socketById.set(clientSocket.id, clientSocket);

    return;
    //return this.gatewayService.create(telemetryPayloadReq);
  } */

  // @OnEvent(CreateCurrTelemetryEvent)
  /* async sendCTPLToWebSocket(
    createTelemetryPayloads: CurrentTelemetryPayload[],
  ) {
    const fnName = this.sendCTPLToWebSocket.name;
    this.logger.info(
      `${fnName} Received current ${createTelemetryPayloads.length} telemetry payloads from telemetry service`,
    );

    const ctplMap = _.groupBy(
      createTelemetryPayloads,
      (ctpl: Partial<CurrentTelemetryPayload> | undefined) =>
        new CurrentTelemetryPayload(ctpl).getKeyWithDevice(),
    );

    for (const [key] of Object.entries(ctplMap)) {
      this.logger.debug(`${fnName} : ctpl map key : ${key}`);
    }

    const toBeSentCTPLsBySocketId: Map<string, CurrentTelemetryPayload[]> =
      new Map();
    for (const [tPLKey, socketId] of this.socketIdByTPLReq) {
      this.logger.debug(`${fnName} : Processing ${tPLKey}`);
      if (_.isNil(ctplMap[tPLKey])) {
        this.logger.debug(`${fnName} : No matching ctpl found for ${tPLKey}`);
        continue;
      } else {
        this.logger.debug(`${fnName} : Found socket for ${tPLKey}`);
        if (toBeSentCTPLsBySocketId.has(socketId)) {
          toBeSentCTPLsBySocketId.get(socketId)!.push(...ctplMap[tPLKey]);
        } else {
          toBeSentCTPLsBySocketId.set(socketId, ctplMap[tPLKey]);
        }
      }
    }
    for (const [socketId, cTPLs] of toBeSentCTPLsBySocketId) {
      if (cTPLs.length === 0) {
        continue;
      } else {
        const socket = this.socketById.get(socketId);
        if (_.isNil(socket)) {
          continue;
        } else {
          const ctplRepo = new CurrentTelemetryPayloadsRepo(cTPLs);
          socket.emit('newCTPLs', ctplRepo.createTelemetyDevicesAndMetrics());
        }
      }
    }
  } */


  @SubscribeMessage('createGateway')
  create(@MessageBody() createGatewayDto: any) {
    this.logger.info('Creating gateway normal : ');
    return this.gatewayService.create(createGatewayDto);
  }

  @SubscribeMessage('findAllGateway')
  findAll() {
    this.logger.info('Finding all gateways');
    return this.gatewayService.findAll();
  }

  @SubscribeMessage('findOneGateway')
  findOne(@MessageBody() id: number) {
    return this.gatewayService.findOne(id);
  }

  @SubscribeMessage('updateGateway')
  update(@MessageBody() updateGatewayDto: UpdateGatewayDto) {
    return this.gatewayService.update(updateGatewayDto.id, updateGatewayDto);
  }

  @SubscribeMessage('removeGateway')
  remove(@MessageBody() id: number) {
    return this.gatewayService.remove(id);
  }
}
