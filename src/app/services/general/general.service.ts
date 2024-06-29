import {Injectable, OnInit} from '@angular/core';
import {Preferences} from "@capacitor/preferences";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {map, pipe} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GeneralService implements OnInit {
  countryListEng: any;
  userId: any;
  hasCompletedSignup: any;
  initData: any;
  userObj: any;
  clientInit: any;
  cities: any;
  token: any;
  currentRout: any;
  providerId: any;

  constructor(private http: HttpClient) {
  }

  async ngOnInit(): Promise<void> {
    await this.getUserData();
  }

  saveToStorage(storageKey: any, value: any) {
    Preferences.set({
      key: storageKey,
      value: (value),
    });
  }

  async getUserData(): Promise<any> {
    let token = await Preferences.get({key: 'accessToken'});
    if (token.value != null) {
      this.token = token.value;
    }
    let user = await Preferences.get({key: 'account'});
    if (user.value != null) {
      this.userObj = JSON.parse(user.value);
      console.log(this.userObj)
      this.userId = this.userObj._id;
    }

    let provider = await Preferences.get({key: 'provider'});
    if (provider.value != null) {
      const providerObj = JSON.parse(provider.value);
      this.providerId = providerObj.provider_id;
    }

  }

  getKeys(obj: any): Array<string> {
    return Object.keys(obj);
  }

  generateRandomEmail(): any {
    const domains = ['example.com', 'test.com', 'demo.com'];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];

    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let username = '';
    for (let i = 0; i < 10; i++) {
      username += chars[Math.floor(Math.random() * chars.length)];
    }
    console.log(`${username}@${randomDomain}`)
    return `${username}@${randomDomain}`;
  }

  async getCountries(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    const response = this.http.get('https://countriesnow.space/api/v0.1/countries/codes', {
      headers: headers
    }).pipe(
      map((response: any) => response.data)
    ).toPromise();
    return response;
  }

  async getCities(code: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>('https://countriesnow.space/api/v0.1/countries/cities', {iso2: code}, {headers: headers})
      .toPromise();
  }

  async getCitiesBasedOnCountry(code: any) {
    this.cities = [];
    this.getCities(code).then(data => {
      this.cities = data?.data;
    })
  }
}
