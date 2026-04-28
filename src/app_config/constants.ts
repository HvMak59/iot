export const IOT_SERVER = 'iot-server';
export const RELATIONS = 'relations';
export const NESTED_RELATIONS = 'nestedRelations';
export const DATA_MODEL_ADAPTOR_URL = `data-model-adaptor`;
export const FIND_ONE = 'findOne';
export const FIND_ONE_BY = 'findOneBy';
export const BY_MULTIPLE_IDS = 'byMultipleIDs';
export const DATA_MODEL_ADAPTOR_FIND_ONE_BY_URL = `${DATA_MODEL_ADAPTOR_URL}/${FIND_ONE}`;
export const DATA_MODEL_ADAPTOR_RELATIONS_FIND_ONE_URL = `${DATA_MODEL_ADAPTOR_URL}/${FIND_ONE}/${RELATIONS}`;
export const DATA_MODEL_ADAPTOR_NESTED_RELATIONS_FIND_ONE_URL = `${DATA_MODEL_ADAPTOR_URL}/${FIND_ONE}/${NESTED_RELATIONS}`;
export const DATA_MODEL_ADAPTOR_RELATIONS_URL = `${DATA_MODEL_ADAPTOR_URL}/${RELATIONS}`;
export const METRICS_ATTRIBUTE_URL = `metrics-attribute`;
export const METRICS_ATTRIBUTE_ADD_DEVICE_TYPE_URL = `${METRICS_ATTRIBUTE_URL}/addDeviceType`;
export const METRICS_ATTRIBUTE_FIND_ONE_BY_URL = `${METRICS_ATTRIBUTE_URL}/${FIND_ONE_BY}`;
export const METRICS_ATTRIBUTE_RELATIONS_URL = `${METRICS_ATTRIBUTE_URL}/${RELATIONS}`;
export const METRICS_ATTRIBUTE_ADAPTOR_URL = `metrics-attribute-adaptor`;
export const METRICS_ATTRIBUTE_ADAPTOR_FIND_ONE_BY_URL = `${METRICS_ATTRIBUTE_ADAPTOR_URL}/${FIND_ONE_BY}`;
export const METRICS_ATTRIBUTE_ADAPTOR_RELATIONS_URL = `${METRICS_ATTRIBUTE_ADAPTOR_URL}/${RELATIONS}`;
export const USER_URL = `user`;
export const USER_RELATIONS_URL = `${USER_URL}/${RELATIONS}`;
export const USER_FIND_OR_FAIL_URL = `${USER_URL}/findByIdOrFail`;
export const USER_AUTHENTICATE_URL = `${USER_URL}/authenticate`;
export const USERS_BY_MULTIPLE_IDS = `${USER_URL}/multipleIDs`;
export const ASSET_TYPE_URL = 'asset-type';
export const ASSET_URL = 'asset';
export const ASSET_BY_ORG_IDs_URL = `${ASSET_URL}/assetsByOrgIds`;
export const ASSET_BY_ASSET_IDs_URL = `${ASSET_URL}/byAssetIDs`;
export const ASSET_WITH_DEVICES_URL = `${ASSET_URL}/findOneByIdWthDevices`;
export const ASSETS_BY_MULTIPLE_IDs_URL = `${ASSET_URL}/${BY_MULTIPLE_IDS}`;
export const ASSETS_BY_MULTIPLE_IDs_WITH_DEVICES_URL = `${ASSET_URL}/byMultipleIDsWithDevices`;
export const ASSETS_WITH_ASSET_STATE_AND_ALERT_COUNT_URL = `${ASSET_URL}/withAssetStateAndAlertCount`;
export const ONLY_ASSETS_URL = `${ASSET_URL}/onlyAssets`;
export const ORG_URL = 'org';
export const ORG_SET_PARENT_URL = `${ORG_URL}/setParent`;
//export const ORG_ADD_USER_URL = `${ORG_URL}/addUser`;
export const DESCEDENTS_ORGS_WITH_SPECIFIED_RELATIONS_URL = `${ORG_URL}/allDescendents`;
//export const DESCEDENTS_ORGS_WITHOUT_ASSETS_URL = `${ORG_URL}/allDescendentsWithoutAssets`;
export const DESCEDENTS_ORGS_WITH_DEEP_NESTED_ASSETS_URL = `${ORG_URL}/allDescendentsWithDeepNestedAssets`;
export const ASCEDENTS_ORGS_WITHOUT_ASSETS_URL = `${ORG_URL}/allAscendentsWithoutAssets`;
export const METRICS_ATTRIBUTE_GROUP_URL = `metrics-attribute-group`;
export const ASSET_TYPE_CURRENT_PERFORMANCE_SOURCE_URL = `asset-type-current-performance-source`;
export const DEVICE_TYPE_URL = 'device-type';
export const DEVICE_MANUFACTURER_URL = 'device-manufacturer';
export const DEVICE_MODEL_URL = 'device-model';
export const DEVICE_MODEL_WITH_ALERTS_URL = `${DEVICE_MODEL_URL}/alerts`;
export const DEVICE_MODEL_BY_CSVIDS_URL = `${DEVICE_MODEL_URL}/csvIDs`;
export const DEVICE_MODEL_BY_CSVIDS_RELATIONS_URL = `${DEVICE_MODEL_BY_CSVIDS_URL}/${RELATIONS}`;
export const METRICS_ATTRIBUTE_FORMULA_URL = 'metrics-attribute-formula';
export const METRICS_ATTRIBUTE_FORMULA_BY_MULTIPLE_IDs_URL = `${METRICS_ATTRIBUTE_FORMULA_URL}/${BY_MULTIPLE_IDS}`;

export const METRICS_ATTRIBUTE_FORMULA_BY_MULTIPLE_IDs_WITH_RELATIONS_URL = `${METRICS_ATTRIBUTE_FORMULA_URL}/${BY_MULTIPLE_IDS}/${RELATIONS}`;
export const DEVICE_URL = 'device';
export const DEVICE_FIND_ONE_BY_ID_URL = `${DEVICE_URL}/findOneById`;
export const DEVICE_WITH_DEVICE_MODEL_URL = `${DEVICE_URL}/device-model`;
export const DEVICE_FROM_MULTIPLE_IDS_URL = `${DEVICE_URL}/${BY_MULTIPLE_IDS}`;
export const DEVICE_MODEL_ALERT_URL = 'device-model-alert';
export const DEVICE_MODEL_ALERT_BY_MULTIPLE_IDs_URL = `${DEVICE_MODEL_ALERT_URL}/${BY_MULTIPLE_IDS}`;
export const DEVICE_ATTACH_ASSET_URL = `${DEVICE_URL}/attach-asset`;
export const DEVICE_ATTACH_VIRTUAL_DEVICE_URL = `${DEVICE_URL}/attach-virtualDevice`;
export const VIRTUAL_DEVICE_URL = 'virtual-device';
export const VIRTUAL_DEVICE_FIND_ONE_URL = `${VIRTUAL_DEVICE_URL}/${FIND_ONE}`;
export const VIRTUAL_DEVICE_ATTACH_DEVICE = `${VIRTUAL_DEVICE_URL}/attach-device`;
export const DEVICE_GROUP_URL = 'device-group';
export const VIRTUAL_DEVICE_GROUP_URL = 'virtual-device-group';
export const UPDATE_VIRTUAL_DEVICE_GROUP_FROM_VIRTUAL_DEVICE_URL = `${VIRTUAL_DEVICE_GROUP_URL}/updateFromVirtualDevice`;
export const METRICS_ATTRIBUTE_AGGREGATION_URL =
  'metrics-attribute-aggregation';
export const GROUP_METRICS_ATTRIBUTE_AGGREGATION_URL =
  'group-metrics-attribute-aggregation';
export const ASSET_CRNT_PERF_SRC_URL = 'asset-current-performance-source';
export const ASSET_CRNT_PERF_SRC_FIND_BY_ASSET_IDS_URL = `${ASSET_CRNT_PERF_SRC_URL}/findByAssetIDs`;
export const ASSET_CRNT_PERF_SRC_CAPACITY_URL = `${ASSET_CRNT_PERF_SRC_URL}/capacitySrcs`;
export const ASSET_CRNT_PERF_SRC_BY_OBJ_URL = `${ASSET_CRNT_PERF_SRC_URL}/findByObj`;
export const MAIN_ATTRIBS_FOR_ASSETS = `${ASSET_CRNT_PERF_SRC_URL}/mainAttrib`;
//export const ASSET_CRNT_PERF_SRC_URL_WITH_RLTNS = `${ASSET_CRNT_PERF_SRC_URL}/${RELATIONS}`;
export const ASSET_CRNT_PERF_SRC_URL_WITH_NESTED_RLTNS = `${ASSET_CRNT_PERF_SRC_URL}/${NESTED_RELATIONS}`;
export const ASSET_CRNT_PERF_SRC_BY_MULTIPLE_IDs_URL = `${ASSET_CRNT_PERF_SRC_URL}/${BY_MULTIPLE_IDS}`;
export const CURR_TELEMETRY_PAYLOAD_URL = 'current-telemetry-payload';
export const CURR_TELEMETRY_PAYLOAD_BY_MULTIPLE_IDs_URL = `${CURR_TELEMETRY_PAYLOAD_URL}/multipleIDs`;
export const DELETE_DEVICE_GROUP_TELEMETRY_FOR_A_PERIOD_URL = `${IOT_SERVER}/deleteDeviceGroupTelemetryForAPeriod`;
export const DELETE_DEVICE_GROUP_CURR_TELEMETRY_PAYLOAD_FOR_A_TIME_PERIOD_URL = `${CURR_TELEMETRY_PAYLOAD_URL}/deviceGroupForAPeriod`;
export const TELEMETRY_PAYLOAD_URL = 'telemetry-payload';
export const TELEMETRY_PAYLOAD_FOR_A_TIME_PERIOD_URL = `${TELEMETRY_PAYLOAD_URL}/timePeriod`;
export const TELEMETRY_PAYLOAD_FOR_MULTIPLE_DEVICES_URL = `${TELEMETRY_PAYLOAD_URL}/multipleDevicesTimePeriod`;
export const SOFT_DELETE_DEVICE_GROUP_TELEMETRY_PAYLOAD_FOR_A_TIME_PERIOD_URL = `${TELEMETRY_PAYLOAD_URL}/softDelete/deviceGroupForAPeriod`;
export const LAST_RECS_FROM_GIVEN_TIME_RANGE_URL = `lastRecsOfGivenTimeRange`;
export const LAST_TELEMETRY_PAYLOADS_FROM_GIVEN_TIME_RANGE_URL = `${TELEMETRY_PAYLOAD_URL}/${LAST_RECS_FROM_GIVEN_TIME_RANGE_URL}`;
export const ASSET_TYPE_CRNT_PERF_SRC_URL =
  'asset-type-current-performance-source';
export const ASSET_TYPE_CRNT_PERF_SRC_RELTNS_URL = `${ASSET_TYPE_CRNT_PERF_SRC_URL}/${RELATIONS}`;
export const ASSET_TYPE_CRNT_PERF_SRC_WITH_SELECTED_ASSETS_URL = `${ASSET_TYPE_CRNT_PERF_SRC_URL}/withSelectedAssets`;
export const ASSET_TYPE_CRNT_PERF_SRC_BY_MULTIPLE_IDs_URL = `${ASSET_TYPE_CRNT_PERF_SRC_URL}/${BY_MULTIPLE_IDS}`;
export const CURRENT_OPEN_ALERT_URL = `current-open-alert`;
export const CURRENT_OPEN_ALERT_FIND_BY_MULTIPLE_IDS = `${CURRENT_OPEN_ALERT_URL}/${BY_MULTIPLE_IDS}`;
export const ALERT_URL = `alert`;
export const CLOSE_ALERTS_URL = `${ALERT_URL}/closeAlerts`;
export const UNIT_URL = 'unit';
export const UNIT_FIND_ALL_URL = `${UNIT_URL}`;
export const DEVICE_MODEL_ATTRIBUTE_URL = 'device-model-attribute';
export const DEVICE_TYPE_METRICS_ATTRIBUTE_URL =
  'device-type-metrics-attribute';
export const DEVICE_TYPE_METRICS_ATTRIBUTE_MANY_URL = `${DEVICE_TYPE_METRICS_ATTRIBUTE_URL}/many`; //URL
export const DEVICE_TYPE_METRICS_ATTRIBUTE_BY_MULTIPLE_IDs_WITH_RELATIONS_URL = `${DEVICE_TYPE_METRICS_ATTRIBUTE_URL}/${BY_MULTIPLE_IDS}/${RELATIONS}`;
export const DEVICEMODEL_METRICSATTRIBUTEFORMULA_URL = `device-model-metrics-attribute-formula`;
export const ASSOCIATED_ORG_USERS_URL = 'org-user';
export const GROUP_URL = 'group';
export const PERIOD_TELEMETRY_PAYLOAD_URL = 'period-telemetry-payload';
export const PERIOD_TELEMETRY_PAYLOAD_BULK_CREATE_URL = `${PERIOD_TELEMETRY_PAYLOAD_URL}/bulk`;
export const DEVICETYPE_METRICSATTRIBUTE_URL = `device-type-metrics-attribute/byMultipleIDs/relations`;
export const DEVICEMODEL_METRICSATTRIBUTE = `device-model-attribute/multipleIDs/relations`;
export const DEVICEMODEL_WITH_UNITS = `${DEVICE_MODEL_URL}/csvIDs/unit`;
export const FIND_DEVICE_BY_ID_AND_STATECODE = `device/findByIdandStateCode`;
export const DEVICE_MODEL_STATE_URL = 'device-model-state';
export const PERIOD_TELEMETRY_FOR_A_TIME_PERIOD_URL = `${PERIOD_TELEMETRY_PAYLOAD_URL}/timePeriod`;
export const PERIOD_TELEMETRY_PAYLOAD_AUDIT_URL =
  'period-telemetry-payload-audit';
export const PERIOD_TELEMETRY_PAYLOAD_AUDIT_CREATE_BULK_URL = `${PERIOD_TELEMETRY_PAYLOAD_AUDIT_URL}/bulk`;
export const DEVICE_RELATION_URL = 'device-relation';
export const USER_ROLE_URL = 'user-role';
export const USER_ROLE_UPDATE_FROM_USER_URL = `${USER_ROLE_URL}/updateFromUser`;

export const ORG_USER_URL = 'org-user';
export const ATTACH_DEVICE_URL = `${DEVICE_URL}/attach-virtualDevice`;

export const DETACH_DEVICE_URL = `${DEVICE_URL}/detach-virtualDevice`;

export const PUBLISH_INTERVAL_IN_SECONDS = 120;

/*Entities*/
export const CURRENT_OPEN_ALERTS = 'currentOpenAlerts';
export const DEVICES = 'devices';
export const ASSETS = 'assets';
export const USERS = 'users';
export const ASSOCIATED_ORGS = 'associatedOrgs';
export const METRIC_ATTRIBUTE = 'metricsAttribute';
export const DEVICE_MODEL = 'deviceModel';
export const DEVICE_MODEL_ATTRIBUTES = 'deviceModelAttributes';
export const VIRTUAL_DEVICE = 'virtualDevice';
export const ASSET = 'asset';

/*Alert codes*/
/* export const FAULT = 'F';
export const WARNING = 'W'; */
export const METRICS_DELAY = 60;
export const LAST_METRICS_RANGE = 60 * 60 * 1000;
export const diffToEndOfDayThreshold = 30 * 60 * 1000;
export const milliSecondsInOneHour = 60 * 60 * 1000;
export const milliSecondsIn10Mins = 10 * 60 * 1000;

/* DB Error codes */
export const DB_DUPLICATE_RECORD = 23505;
export const DUPLICATE_RECORD = 'Duplicate record';
export const NO_RECORD = 'No record';
export const KEY_SEPARATOR = ':';
export const RMU = 'RMU';
export const VFD = 'VFD';
export const excludedMetaFinMetricsAttributes = ['Litre_Per_Minute'];
export const NOT_FOUND = 'NOT_FOUND';
export const RMU_OFFLINE = 'rmuOffline';
export const RMU_OFFLINE_THRESHOLD = 20 * 60 * 1000;

export const PASSWORD_DOES_NOT_MATCH = 'Password does not match';
export const USER_DOES_NOT_EXIST = 'User does not exist';
export const INVALID_USERNAME_OR_PASSWORD = 'Invalid username or password';
export const CURRENT_PASSWORD_DOES_NOT_MATCH =
  'Current password does not match';
export const USER_NOT_IN_REQUEST_HEADER = 'User not in request header';


export const NO_OF_SALTS = 10;

export const REF_INSTALLATION_YEAR = 2024;
export const REF_INSTALLATION_MONTH = 6;
export const REF_INSTALLATION_DAY = 5;

/* Events */
export const CreateTelemetry = 'Create.Telemetry';
export const CreateCurrTelemetryEvent = 'Create.Current.Telemetry';
export const CalculatedEODTelemetry = 'CalculatedEODTelemetry';
export const SavedTelemetryPayload = 'Saved.Telemetry';


export const SolarPlant = 'SolarPlant';
export const SolarMotor = 'SolarMotor';
export const AssetCapacity = "AssetCapacity";

export const SolarAsset = new Set([SolarPlant, SolarMotor]);

export const ignoreStartHrForSolar = 21;
export const ignoreEndHrForSolar = 5;
