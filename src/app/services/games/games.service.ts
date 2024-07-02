import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GeneralService} from "../general/general.service";
import {ConfigService} from "../config/config.service";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  constructor(private http: HttpClient, private generalService: GeneralService,
              private config: ConfigService,) {
  }

  async gameInit(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    const response = this.http.get(this.config.url('game/init'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }
}
