import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
  UpdateEvent,
} from 'typeorm';
import { CurrentOpenAlert } from '../entities/current-open-alert.entity';

@EventSubscriber()
export class CurrentOpenAlertSubscriber
  implements EntitySubscriberInterface<CurrentOpenAlert> {
  /*listenTo() : string | Function {
    return CurrentOpenAlert;
  }

  beforeInsert(event: InsertEvent<CurrentOpenAlert>): void | Promise<any> {
    console.log(
      `Before Insert on Current Open Alert called : ${JSON.stringify(
        event.entity,
      )}`,
    );
    event.entity.searchTerm = this.setSearchTerm(event.entity);
  }

  beforeUpdate(event: UpdateEvent<CurrentOpenAlert>): void | Promise<any> {
    console.log(
      `Before Update on Current Open Alert called : ${JSON.stringify(
        event.entity,
      )}`,
    );
    event.entity
      ? (event.entity.searchTerm = this.setSearchTerm(
          event.entity as CurrentOpenAlert,
        ))
      : null;
  }

  setSearchTerm(currentOpenAlert: CurrentOpenAlert) {
    return (
      //currentOpenAlert.assetId +
      currentOpenAlert.deviceId +
      currentOpenAlert.virtualDeviceId +
      currentOpenAlert.alertId +
      currentOpenAlert.message
    );
  }*/
}
