// import { MetricsFrequency } from 'src/utils/enums';

import { MetricsFrequency } from 'src/common';

/* export class TelemetryDisplayProperty extends PickType(AssetTypeCurrentPerformanceSource, ['measureLabel', 'measureGroup', 'measureGroupDispOrder', 'measureItemDispOrder']) {
    constructor(telemetryDisplayProperty: Partial<AssetCurrentPerformanceSource>) {
        super();
        if (telemetryDisplayProperty) {
            this.label = telemetryDisplayProperty.label ? telemetryDisplayProperty.label : '';
            this.measureGroup = telemetryDisplayProperty.measureGroup ? telemetryDisplayProperty.measureGroup : '';
            this.measureGroupDispOrder = telemetryDisplayProperty.measureGroupDispOrder ? telemetryDisplayProperty.measureGroupDispOrder : 0;
            this.measureItemDispOrder = telemetryDisplayProperty.measureItemDispOrder ? telemetryDisplayProperty.measureItemDispOrder : 0;
        }
        else {
            Object.assign(this, {});
        }
    }
}; */
export interface TelemetryDisplayProperty {
  //measureGroupName: string;
  metricsAttributeId: string;
  frequency: MetricsFrequency;
  unit?: string;
  displayOrder?: number;
  displayName: string;
  displayPriority?: number;

  /* chartTitle: string;
  measureGroupDispOrder: number; */
  //displayPriority?: number;
  //displayOrder: number;
  //displayName: string;
  /* constructor(
    public displayOrder: number,
    public displayName: string,
    public displayPriority?: number,
  ) {
    
  } */
}
