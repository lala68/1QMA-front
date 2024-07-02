import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GeneralService} from "../general/general.service";
import {ConfigService} from "../config/config.service";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient, private generalService: GeneralService,
              private config: ConfigService,) {
  }

  async clientInit(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    const response = this.http.get(this.config.url('client/init'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async updateProfileClient(data: any, userId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('client/profile/update'), {id: userId, ...data}, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async updateSettings(data: any, userId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('client/settings/update'), {id: userId, ...data}, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async inviteFriend(data: any, userId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('client/invite'), {id: userId, email: data.email}, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async postProfilePicture(data: any): Promise<any> {
    let headers = new HttpHeaders({

    });

    const formData = new FormData();
    formData.append('id', this.generalService.userId);
    formData.append('avatar', data);

    return this.http.post<any>(this.config.url('client/profilePicture/update'), formData, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async removeProfilePicture(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('client/profilePicture/remove'), {id: this.generalService.userId}, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async addQuestion(data: any, category: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('client/questions/add'), {
      id: this.generalService.userId,
      ...data, category: category
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async getUserById(id: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    const response = this.http.get(this.config.url('client/' + id + '/details'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }
}
