import {Injectable, Injector} from '@angular/core';
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";
import {AuthService} from "../auth/auth.service";


@Injectable({
  providedIn: 'root'
})
export class ProcessHTTPMsgService {

  constructor(private injector: Injector) {

  }

  public async handleError(error: HttpErrorResponse | any) {
    const userAccount = this.injector.get<AuthService>(AuthService);
    let errMsg: string;

    if (error.error instanceof ErrorEvent) {
      errMsg = error.error.title;
    } else {
      errMsg = error.error.title;
    }
    switch (error.error.status) {
      case 400:
        // alert('request-is-not-valid.');
        // alert(error.error.title);
        break;

      case 401:
        await userAccount.forceToLoginAgain();
        break;

      case 403:
        alert('Forbidden-resource');
        break;

      case 413:
        alert('your-request-contains-too-large-content.');
        break;

      case 500:
        alert('service-is-currently-unavailable.');
        break;

      case 502:
        alert('service-is-currently-unavailable.');
        break;

      case 503:
        alert('service-is-currently-unavailable.');
        break;

      case 0:
        alert('please-check-your-internet-connection-and-try-again.');
        break;

      default:
        // alert('some-error-occurred,please-try-again.');
        break;
    }

    return throwError(errMsg);
  }
}
