import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {finalize} from "rxjs/operators";
import {LoaderService} from "../loader/loader.service";

@Injectable()
export class LoaderInterceptService implements HttpInterceptor {

  constructor(private loader: LoaderService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loader.show();
    return next.handle(req).pipe(
      finalize(() => {
        this.loader.hide();
      }));
  }
}
