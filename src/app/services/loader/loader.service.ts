import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoading$ = new Subject<boolean>();

  show(): void {
    setTimeout(() =>       this.isLoading$.next(true), 10);
  }

  hide(): void {
    this.isLoading$.next(false);
  }
}
