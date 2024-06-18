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
    let b = await Preferences.get({key: 'account'});
    if (b.value != null) {
      console.log(JSON.parse(b.value));
      this.userObj = JSON.parse(b.value);
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

  async getCities(country: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>('https://countriesnow.space/api/v0.1/countries/cities', {country: country}, {headers: headers})
      .toPromise();
  }

  async getCitiesBasedOnCountry(country: any) {
    this.cities = [];
    this.getCities(country).then(data => {
      this.cities = data?.data;
    })
  }
}
