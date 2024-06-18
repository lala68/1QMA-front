import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GeneralService} from "../general/general.service";
import {ConfigService} from "../config/config.service";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient, private generalService: GeneralService,
              private config: ConfigService,) { }

  async clientInit(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    const response = this.http.get(this.config.url('client/init'), {
      headers: headers
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async updateProfileClient(data: any, userId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('client/profile/update'), {id: userId, ...data}, {headers: headers})
      .toPromise();
  }

  async updateSettings(data: any, userId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('client/settings/update'), {id: userId, ...data}, {headers: headers})
      .toPromise();
  }
}
