// import { Injectable, Logger } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
// import { InjectRepository } from '@nestjs/typeorm';
// import { LessThan, Not, IsNull, Repository } from 'typeorm';

// // import { CurrentTelemetryPayload } from './entities/current-telemetry-payload.entity';

// import { EventEmitter2 } from '@nestjs/event-emitter';
// import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';

// @Injectable()
// export class CronJobsService {
//   private readonly logger = new Logger(CronJobsService.name);

//   /**
//    * Keeps currently offline assetIds in memory.
//    * This avoids duplicate "offline" alert creation on every cron run.
//    */
//   private readonly offlineAssets = new Set<string>();

//   /**
//    * Optional: if you want metric-level offline tracking instead of only asset-level,
//    * you can also keep this.
//    * key format: assetId::virtualDeviceId::metricsAttributeId
//    */
//   private readonly offlineTelemetryKeys = new Set<string>();

//   private readonly STALE_MINUTES = Number(
//     process.env.TELEMETRY_STALE_THRESHOLD_MINUTES ?? 20,
//   );

//   constructor(
//     // @InjectRepository(CurrentTelemetryPayload)
//     // private readonly currentTelemetryPayloadRepo: Repository<CurrentTelemetryPayload>,

//     // inject your own alert service/repo here
//     // private readonly alertService: AlertService,

//     private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
//     private readonly eventEmitter: EventEmitter2,
//   ) {}

//   /**
//    * Every 5 minutes
//    */
//   @Cron('*/5 * * * *', {
//     name: 'check-stale-current-telemetry',
//     timeZone: 'UTC',
//   })
//   async checkForStaleTelemetry() {
//     const fnName = this.checkForStaleTelemetry.name;
//     const now = new Date();
//     const cutoffTime = new Date(now.getTime() - this.STALE_MINUTES * 60 * 1000);

//     this.logger.log(
//       `${fnName} | Started | cutoffTime=${cutoffTime.toISOString()}`,
//     );

//     try {
//       /**
//        * Step 1:
//        * Find all rows whose latest txnCaptureTime is older than cutoff
//        */
//       const staleTelemetryRows = await this.currentTelemetryPayloadService.find({
//         where: {
//           metric: {
//             txnCaptureTime: LessThan(cutoffTime),
//           },
//         },
//         relations: {
//           virtualDevice: false,
//         },
//       });

//       /**
//        * Step 2:
//        * Find all rows which are fresh
//        */
//       const freshTelemetryRows = await this.currentTelemetryPayloadRepo.find({
//         where: {
//           metric: {
//             txnCaptureTime: Not(LessThan(cutoffTime)),
//           },
//         },
//         relations: {
//           virtualDevice: false,
//         },
//       });

//       /**
//        * Build asset status maps
//        */
//       const staleAssetIds = new Set<string>();
//       const freshAssetIds = new Set<string>();

//       for (const row of staleTelemetryRows) {
//         if (row.assetId) staleAssetIds.add(row.assetId);
//       }

//       for (const row of freshTelemetryRows) {
//         if (row.assetId) freshAssetIds.add(row.assetId);
//       }

//       /**
//        * Final offline asset rule:
//        * Asset is offline only if it has stale telemetry and no fresh telemetry.
//        */
//       const newlyDetectedOfflineAssets: string[] = [];
//       const recoveredAssets: string[] = [];

//       for (const assetId of staleAssetIds) {
//         const isActuallyOffline = !freshAssetIds.has(assetId);

//         if (isActuallyOffline && !this.offlineAssets.has(assetId)) {
//           this.offlineAssets.add(assetId);
//           newlyDetectedOfflineAssets.push(assetId);
//         }
//       }

//       /**
//        * Recover assets which were offline before but now have fresh telemetry
//        */
//       for (const assetId of Array.from(this.offlineAssets)) {
//         if (freshAssetIds.has(assetId)) {
//           this.offlineAssets.delete(assetId);
//           recoveredAssets.push(assetId);
//         }
//       }

//       /**
//        * Step 3:
//        * Handle newly offline assets
//        */
//       for (const assetId of newlyDetectedOfflineAssets) {
//         const assetTelemetry = staleTelemetryRows.filter(
//           (row) => row.assetId === assetId,
//         );

//         this.logger.warn(
//           `${fnName} | Asset OFFLINE detected | assetId=${assetId}`,
//         );

//         // create one asset-level alert
//         await this.createOfflineAlertForAsset(assetId, assetTelemetry, cutoffTime);

//         // optional event emit
//         this.eventEmitter.emit('alert.created', {
//           assetId,
//           alerts: [
//             {
//               type: 'ASSET_OFFLINE',
//               assetId,
//               message: `Asset ${assetId} is offline. No fresh telemetry received in last ${this.STALE_MINUTES} minutes.`,
//             },
//           ],
//         });
//       }

//       /**
//        * Step 4:
//        * Handle recovered assets
//        */
//       for (const assetId of recoveredAssets) {
//         this.logger.log(`${fnName} | Asset ONLINE recovered | assetId=${assetId}`);

//         await this.resolveOfflineAlertForAsset(assetId);

//         this.eventEmitter.emit('alert.closed', {
//           assetId,
//           alerts: [
//             {
//               type: 'ASSET_OFFLINE',
//               assetId,
//               message: `Asset ${assetId} is back online.`,
//             },
//           ],
//         });
//       }

//       /**
//        * Step 5:
//        * Optional telemetry-level tracking
//        * If you also want to know exactly which metric became stale,
//        * keep metric-level memory too.
//        */
//       await this.handleMetricLevelTracking(staleTelemetryRows, freshTelemetryRows);

//       this.logger.log(
//         `${fnName} | Completed | staleAssets=${staleAssetIds.size} | freshAssets=${freshAssetIds.size} | currentlyOffline=${this.offlineAssets.size}`,
//       );
//     } catch (error) {
//       this.logger.error(
//         `${fnName} | Error : ${error?.message ?? error}`,
//         error?.stack,
//       );
//     }
//   }

//   /**
//    * Asset-level offline alert creation
//    */
//   private async createOfflineAlertForAsset(
//     assetId: string,
//     staleTelemetryRows: CurrentTelemetryPayload[],
//     cutoffTime: Date,
//   ): Promise<void> {
//     const oldestTime = staleTelemetryRows
//       .map((row) => row.metric?.txnCaptureTime)
//       .filter((d): d is Date => !!d)
//       .sort((a, b) => a.getTime() - b.getTime())[0];

//     const affectedMetrics = staleTelemetryRows.map(
//       (row) => row.metric?.metricsAttributeId,
//     );

//     const message =
//       `Asset ${assetId} is offline. ` +
//       `No fresh telemetry received in the last ${this.STALE_MINUTES} minutes. ` +
//       `Affected metrics: ${affectedMetrics.join(', ')}. ` +
//       `Oldest stale txnCaptureTime: ${oldestTime?.toISOString() ?? 'NA'}. ` +
//       `Cutoff: ${cutoffTime.toISOString()}.`;

//     /**
//      * Replace this with your actual alert creation logic.
//      * Example:
//      *
//      * await this.alertService.create({
//      *   assetId,
//      *   type: 'ASSET_OFFLINE',
//      *   severity: 'HIGH',
//      *   status: 'OPEN',
//      *   message,
//      * });
//      */

//     this.logger.warn(`createOfflineAlertForAsset | ${message}`);
//   }

//   /**
//    * Asset-level offline alert resolution
//    */
//   private async resolveOfflineAlertForAsset(assetId: string): Promise<void> {
//     /**
//      * Replace this with your actual alert close logic.
//      * Example:
//      *
//      * await this.alertService.closeOpenAlerts({
//      *   assetId,
//      *   type: 'ASSET_OFFLINE',
//      * });
//      */

//     this.logger.log(
//       `resolveOfflineAlertForAsset | Asset ${assetId} marked online and offline alert resolved`,
//     );
//   }

//   /**
//    * Optional:
//    * metric-level stale tracking
//    * Useful if you want to know which exact telemetry key became stale.
//    */
//   private async handleMetricLevelTracking(
//     staleTelemetryRows: CurrentTelemetryPayload[],
//     freshTelemetryRows: CurrentTelemetryPayload[],
//   ): Promise<void> {
//     const currentStaleKeys = new Set<string>();
//     const currentFreshKeys = new Set<string>();

//     for (const row of staleTelemetryRows) {
//       const key = this.getTelemetryTrackingKey(row);
//       if (key) currentStaleKeys.add(key);
//     }

//     for (const row of freshTelemetryRows) {
//       const key = this.getTelemetryTrackingKey(row);
//       if (key) currentFreshKeys.add(key);
//     }

//     // newly stale
//     for (const key of currentStaleKeys) {
//       if (!currentFreshKeys.has(key) && !this.offlineTelemetryKeys.has(key)) {
//         this.offlineTelemetryKeys.add(key);

//         this.logger.warn(`Telemetry became stale | key=${key}`);

//         // optional: create metric-level alert here
//       }
//     }

//     // recovered
//     for (const key of Array.from(this.offlineTelemetryKeys)) {
//       if (currentFreshKeys.has(key)) {
//         this.offlineTelemetryKeys.delete(key);

//         this.logger.log(`Telemetry recovered | key=${key}`);

//         // optional: close metric-level alert here
//       }
//     }
//   }

//   private getTelemetryTrackingKey(row: CurrentTelemetryPayload): string | null {
//     if (!row.assetId || !row.metric?.metricsAttributeId) {
//       return null;
//     }

//     return [
//       row.assetId,
//       row.virtualDeviceId ?? '',
//       row.metric.metricsAttributeId,
//     ].join('::');
//   }
// }