export enum EntityStateEnum {
    NEW,
    ONLINE,
    /* WARNING,
    FAULT, */
    OFFLINE,
}

export enum AlertType {
    WARNING,
    FAULT,
}

export enum AlertLevel {
    fault = 'fault',
    critical = 'critical',
    info = 'info',
    major = 'major',
    minor = 'minor',
    warning = 'warning',
}

export enum MetricsFrequency {
    INSTANT,
    DAILY,
    WEEKLY,
    MONTHLY,
    QUARTERLY,
    YEARLY,
    TOTAL,
}

export enum MathOperator {
    nonZeroAvg = 'nonZeroAvg',
    avg = 'avg',
    sum = 'sum',
    min = 'min',
    max = 'max',
    count = 'count',
}

export enum CalcFrequency {
    instant = 'instant',
    daily = 'daily',
    weekly = 'weekly',
    monthly = 'monthly',
    quarterly = 'quarterly',
    yearly = 'yearly',
}

export enum MetricType {
    original = 'original',
    calculated = 'calculated',
}

export enum CleanUpMode {
    scheduled = 'scheduled',
    standAlone = 'standAlone',
}

export enum DisplayPriority {
    FIRST,
    SECOND,
    THIRD,
    FOURTH,
}

export enum ChartType {
    LINE,
    BAR,
    PIE,
    GAUGE,
}

export enum DeviceRelationType {
    MONITORED_BY,
}
export enum Relations {
    NONE,
    MIN,
    MIN_WO_TXNS,
    ALL,
    ALL_WO_TXNS,
}

export enum OrgType {
    AssociatedOrg,
    PlatformProvider,
    ServiceProvider,
    Division,
    Client,
}

export enum RoleType {
    FullAccess,
    ReadOnly,
}

export enum DeviceModelAlertFindMethod {
    ONLY_DEVICE,
    ONLY_RMU,
    DEVICE_AND_RMU,
    DEVICE_OR_RMU,
}

// export enum AlertStatus {
//     CREATED = 'CREATED',
//     INCREMENTED = 'INCREMENTED',
//     CLOSED = 'CLOSED'
// }
export enum AlertStatus {
    created = 'created',
    incremented = 'incremented',
    closed = 'closed'
}

export enum ContractType {
    fixedPrice,
    monthyRate,
    annualRate,
}

export enum AggStrategy {
    last = 'last',
    within20Mins = 'within20Mins',
}

export enum ruleStoreOutputEvent {
    createAlert = 'createAlert',
}

/* export enum recordAddStatus {
  ADDED,
  EXISTS,
  ERROR,
} */
