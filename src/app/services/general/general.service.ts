import {Injectable, OnInit} from '@angular/core';
import {Preferences} from "@capacitor/preferences";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {map, pipe} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";

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
  startingGame: any = false;
  socket: any;
  players: any = [];
  gameInit: any;
  gameStep: any = 1;
  createdGameData: any;
  gameQuestion: any = '';
  specificQuestionAnswers: any;
  finishedTimer: boolean = false;
  gameAnswerGeneral: any;
  editingAnswer: boolean = true;
  nextButtonDisable: boolean = false;
  allQuestions: any = [];
  gameResult: any;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {
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
    let user = await Preferences.get({key: 'account'});
    if (user.value != null) {
      try {
        var testIfJson = JSON.parse(user.value);
        if (typeof testIfJson == "object") {
          //Json
          this.userObj = JSON.parse(user.value);
          this.userId = this.userObj._id;
        } else {
          //Not Json
          this.userObj = (user.value);
          this.userId = this.userObj._id;
        }
      } catch {
        this.userObj = (user.value);
        this.userId = this.userObj._id;
      }
    }
  }

  async getItem(key: string): Promise<any> {
    const item = await Preferences.get({key: key});
    if (item.value != null) {
      return JSON.parse(item.value);
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

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {duration: 3000});
  }
}
