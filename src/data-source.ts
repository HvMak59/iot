import 'reflect-metadata';
//import 'dotenv/config';

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { Org } from '../src/org/entities/org.entity';
// import { AssetType } from '../src/asset-type/entities/asset-type.entity';
import { Asset } from '../src/asset/entities/asset.entity';
import { DeviceManufacturer } from '../src/device-manufacturer/entities/device-manufacturer.entity';
import { DeviceType } from '../src/device-type/entities/device-type.entity';
import { DeviceModel } from './device-model/entities/device-model.entity';
import { TelemetryPayload } from '../src/telemetry-payload/entities/telemetry-payload.entity';
import { Device } from './device/entities/device.entity';
import { MetricsAttributeFormula } from './metrics-attribute-formula/entities/metrics-attribute-formula.entity';
import { Group } from './group/entities/group.entity';
import { MetricsAttributeAggregation } from './metrics-attribute-aggregation/entities/metrics-attribute-aggregation.entity';
import { CurrentTelemetryPayload } from './current-telemetry-payload/entities/current-telemetry-payload.entity';
import { TelemetryHeader } from '../src/telemetry-header/entities/telemetry-header.entity';
import { AssetCurrentPerformanceSource } from '../src/asset-current-performance-source/entities/asset-current-performance-source.entity';
import { AuditDateTime } from './audit_attribute/entities/audit_date_time.entity';
// import { MetricsAttributeGroup } from './metrics-attribute_group/entities/metrics-attribute_group.entity';
import { AssetTypeCurrentPerformanceSource } from './asset-type-current-performance-source/entities/asset-type-current-performance-source.entity';
import { CurrentOpenAlert } from './current-open-alert/entities/current-open-alert.entity';
// import { DataModelAdaptor } from './data-model-adaptor/entities/data-model-adaptor.entity';
import { MetricsAttribute } from './metrics-attribute/entities/metrics-attribute.entity';
import { MetricsAttributeAdaptor } from './metrics-attribute-adaptor/entities/metrics-attribute-adaptor.entity';
import { Alert } from './alert/entities/alert.entity';
import { DeviceModelAlert } from './device-model-alert/entities/device-model-alert.entity';
// import { DeviceModelState } from './device-model-state/entities/device-model-state.entity';
// import { Unit } from './unit/entities/unit.entity';
// import { DeviceModelAttribute } from './device-model-attribute/entities/device-model-attribute.entity';
import { DeviceTypeMetricsAttribute } from './device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { DeviceModelMetricsAttributeFormula } from './device-model-metrics-attribute-formula/entities/device-model-metrics-attribute-formula.entity';
import { OrgUser } from './org-user/entities/org-user.entity';

import { GroupMetricsAttributeAggregation } from './group-metrics-attribute-aggregation/entities/group-metrics-attribute-aggregation.entity';
// import { DeviceRelation } from './device-relation/entities/device-relation.entity';
import { VirtualDevice } from './virtual-device/entities/virtual-device.entity';
import { VirtualDeviceGroup } from './virtual-device-group/entities/virtual-device-group.entity';
// import { Country } from './state/entities/country.entity';
// import { State } from './state/entities/state.entity';
// import { District } from './district/entities/district.entity';
// import { Role } from './role/entities/role.entity';
// import { UserRole } from './user-role/entities/user-role.entity';
// import { Contract } from './contract/entities/contract.entity';
// import { TodayTelemetryPayload } from './today-telemetry-payload/entities/today-telemetry-payload.entity';
// import { AssetRule } from './asset-rules/entities/asset-rule.entity';
// import { RuleStore } from './rule-store/entities/rule-store.entity';
// import { AlertMaster } from './alert-master/entities/alert-master.entity';
// import { AlertMasterIdentifier } from './alert-master-identifier/entities/alert-master-identifier.entity';
// import { RuleStoreIdentifier } from './rule-store-identifier/entities/rule-store-identifier.entity';
// import { OutgoingUrl } from './outgoing-url/entities/outgoing-url.entity';
import { EventType } from './event-type/entities/event-type.entity';
import { EventInstance } from './event-instance/entities/event-instance.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  /*Postgres configurations*/
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
    process.env.DB_SSL === 'true'
      ? ({
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA_PATH
          ? fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8')
          : process.env.DB_SSL_CA?.replace(/\\n/g, '\n'),
        checkServerIdentity: (host: string, cert: any) => {
          console.log('Server cert subject:', cert.subject);
          console.log('Server cert SAN:', cert.subjectaltname);

          return undefined;
        }
      } as any)
      : false,


  /* Sqlite configurations */
  /* type: "sqlite",
    database: "/home/dipeniot/SqliteDBFiles/iotdev", */

  /* Common configurations */
  entities: [
    User,
    Org,
    // AssetType,
    Asset,
    DeviceManufacturer,
    DeviceType,
    DeviceModel,
    // DeviceModelState,
    DeviceModelAlert,
    Device,
    MetricsAttributeFormula,
    Group,
    MetricsAttributeAggregation,
    TelemetryPayload,
    CurrentTelemetryPayload,
    TelemetryHeader,
    AssetCurrentPerformanceSource,
    AuditDateTime,
    // MetricsAttributeGroup,
    AssetTypeCurrentPerformanceSource,
    CurrentOpenAlert,
    // DataModelAdaptor,
    MetricsAttribute,
    MetricsAttributeAdaptor,
    Alert,
    // Unit,
    // DeviceModelAttribute,
    DeviceTypeMetricsAttribute,
    DeviceModelMetricsAttributeFormula,
    OrgUser,
    GroupMetricsAttributeAggregation,
    // DeviceRelation,
    VirtualDevice,
    VirtualDeviceGroup,
    // Country,
    // State,
    // District,
    // Role,
    // UserRole,
    // Contract,
    // TodayTelemetryPayload,
    // RuleStore,
    // AssetRule,
    // AlertMaster,
    // AlertMasterIdentifier,
    // RuleStoreIdentifier,
    // OutgoingUrl,
    EventType,
    EventInstance,
  ],
  //entities: ["./entity/*.ts"],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  migrations: [],
  subscribers: [],
});
