import {Injectable, OnInit} from '@angular/core';
import {Preferences} from "@capacitor/preferences";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {map, pipe} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "../../components/snackbar-content/snackbar-content.component";

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
  gameAnswerGeneral: any;
  editingAnswer: boolean = true;
  isGameCancel: boolean = false;
  allQuestions: any = [];
  invitedPlayersArray: any = [];
  gameResult: any;
  disconnectedModal: any = '';
  rateAnswers: { answer_id: string, rate: string }[] = [];
  rateQuestions: { question_id: string, rate: string }[] = [];


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
    console.log(this.userObj)
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
      if (data.data) {
        this.cities = data.data.sort((a: any, b: any) => a.localeCompare(b));
      }
    });
  }

  openSnackBar(message: string, title: any) {
    this._snackBar.openFromComponent(SnackbarContentComponent, {
      data: {
        title: title,
        message: message
      },
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: title === 'Success' ? 'app-notification-success' : (title === 'Error' ? 'app-notification-error' : 'app-notification-default')
    });
  }

  getImageAsBinary(imagePath: string): Promise<ArrayBuffer> {
    return this.http.get(imagePath, {responseType: 'blob'}).toPromise()
      .then(blob => {
        return new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(<Blob>blob);
        });
      });
  }
}
