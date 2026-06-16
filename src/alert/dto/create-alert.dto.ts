import { PartialType } from '@nestjs/mapped-types';
// import { KEY_SEPARATOR } from 'src/app_config/constants';
// import { AlertMaster } from 'src/alert-master/entities/alert-master.entity';
// import { DeviceModelAlert } from 'src/device-model-alert/entities/device-model-alert.entity';
// import { Device } from 'src/device/entities/device.entity';
// import { AlertType, DeviceModelAlertFindMethod } from 'src/utils/enums';

import { Alert } from '../entities/alert.entity';
import { InputAlertDto } from './input-alert.dto';
import { InputAlert2Dto } from './input-alert2.dto';
import { AlertMaster } from 'src/alert-master/entities/alert-master.entity';
// import { DeviceModelAlert } from 'device-model-alert/entities/device-model-alert.entity';
// import { AlertType } from 'src/utils/enums';
// import { AlertMaster } from 'alert-master/entities/alert-master.entity';

export class CreateAlertDto extends PartialType(Alert) {
  constructor(createAlertDto: CreateAlertDto) {
    super(createAlertDto);
    Object.assign(this, createAlertDto);
  }

  // static createFromInputAlertDTO(
  //   inputAlertDTO: InputAlertDto,
  //   dvcMdlAlrt: DeviceModelAlert | null | undefined,
  // ) {
  //   return new CreateAlertDto({
  //     alertId: inputAlertDTO.alertId,
  //     alertType: dvcMdlAlrt?.alertType ?? AlertType.FAULT,
  //     assetId: inputAlertDTO.assetId,
  //     deviceId: inputAlertDTO.deviceId,
  //     virtualDeviceId: inputAlertDTO.virtualDeviceId,
  //     sourceAttribute: inputAlertDTO.sourceAttribute,
  //     //metricsAttributeId: inputAlertDTO.metricsAttributeId,
  //     message: dvcMdlAlrt?.message ?? 'Unknown error',
  //     possibleCause: dvcMdlAlrt?.possibleCause,
  //     proposedSolution: dvcMdlAlrt?.proposedSolution,
  //     openDateTime: inputAlertDTO.openDateTime,
  //   });
  // }

  static createFromInputAlert2DTO(
    inputAlertDTO: InputAlert2Dto,
    alertMaster?: AlertMaster | null | undefined,
  ) {
    return new CreateAlertDto({
      alertId: inputAlertDTO.alertId,
      //alertType: alertMaster?.alertType ?? AlertType.FAULT,
      alertLevel: alertMaster?.alertLevel,
      assetId: inputAlertDTO.assetId,
      deviceId: inputAlertDTO.deviceId,
      virtualDeviceId: inputAlertDTO.virtualDeviceId,
      sourceAttribute: inputAlertDTO.sourceAttribute,
      //metricsAttributeId: inputAlertDTO.metricsAttributeId,
      message: alertMaster?.message ?? 'Unknown error',
      possibleCause: alertMaster?.possibleCause,
      proposedSolution: alertMaster?.proposedSolution,
      openDateTime: inputAlertDTO.openDateTime,
    });
  }
}
