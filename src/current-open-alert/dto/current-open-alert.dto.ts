import { AuditDateTime } from '../../audit_attribute/entities/audit_date_time.entity';
import { Device } from '../../device/entities/device.entity';
import { CurrentOpenAlert } from '../entities/current-open-alert.entity';

export class CurrentOpenAlertDto {
  constructor(currentOpenAlertDto: Partial<CurrentOpenAlert>) {
    const { openDateTime, closeDateTime, ...currOpenAlertWithoutTimings } =
      currentOpenAlertDto;
    Object.assign(this, currOpenAlertWithoutTimings);
    if (currentOpenAlertDto.openDateTime)
      this.openDateTime = new Date(currentOpenAlertDto.openDateTime).valueOf();
    if (currentOpenAlertDto.closeDateTime)
      this.closeDateTime = new Date(
        currentOpenAlertDto.closeDateTime,
      ).valueOf();

    //this.assetId = currentOpenAlertDto.virtualDevice?.assetId;
  }
  id: string;

  alertId: string;

  alertType: string;

  //asset: Asset;

  assetId?: string;

  device: Device;

  deviceId?: string;

  virtualDeviceId?: string;

  message?: string;

  possibleCause?: string;

  proposedSolution?: string;

  openDateTime?: number;

  closeDateTime?: number;

  alertCount: number;

  isRuleBased: boolean;

  //auditDateTime: AuditAttribute;
}
