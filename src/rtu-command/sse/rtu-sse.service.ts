
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class RtuSseService {

    private readonly responseSubject =
        new Subject<any>();

    getResponseStream() {
        return this.responseSubject.asObservable();
    }

    sendResponse(response: any) {
        this.responseSubject.next(response);
    }
}
