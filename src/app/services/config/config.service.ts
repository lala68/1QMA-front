import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() {
  }

  url(path: string, param?: string | number): string {
    if (param) {
      path += '/' + param.toString();
    }
    const url = new URL(path, environment.baseUrl);
    return url.href;
  }
}
