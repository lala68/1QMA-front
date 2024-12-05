import {Injectable, OnInit} from '@angular/core';
import {Preferences} from "@capacitor/preferences";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {map, pipe, Subject, takeUntil} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "../../components/snackbar-content/snackbar-content.component";
import {Router} from "@angular/router";
import {FormControl} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})


export class GeneralService implements OnInit {
  countryListEng: any;
  userId: any;
  emailVerified: any;
  hasCompletedSignup: any;
  initData: any;
  userObj: any;
  clientInit: any;
  cities: any;
  token: any;
  currentRout: any;
  startingGame: any = false;
  startingGameTutorial: any = false;
  socket: any;
  players: any = [];
  gameInit: any;
  gameStep: any = 1;
  gameTutorialStep: any = 1;
  createdGameData: any;
  gameQuestion: any = '';
  toggleValueTranslate: any;
  selectedTranslatedLanguage: any = '';
  specificQuestionAnswers: any;
  gameAnswerGeneral: any;
  editingAnswer: boolean = true;
  isGameCancel: boolean = false;
  allQuestions: any = [];
  invitedPlayersArray: any = [];
  gameResult: any;
  notifList: any;
  newNotif: boolean = false;
  disconnectedModal: any = '';
  waitingModal: any = '';
  rateAnswers: { answer_id: string, rate: string }[] = [];
  rateQuestions: { question_id: string, rate: string }[] = [];
  cityFilterCtrl = new FormControl();
  filteredCities: any[] = [];
  private _onDestroy = new Subject<void>();
  wordCountAnswer: number = 100;
  isMobileView: boolean = false;
  direction: any = 'ltr';
  selectedTabIndexParentInTrivia: any = 0;
  selectedTabIndexQuestionChildInTrivia: any = 0;
  selectedTabIndexGameChildInTrivia: any = 0;
  keepAliveInterval: any;
  isDisconnectedModal: boolean = false;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar, private translate: TranslateService) {
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
        // Set up translation and direction
        await this.translate.use(this.userObj?.preferedLanguage?.code).toPromise(); // Ensures language change is complete
        document.documentElement.dir = this.userObj?.preferedLanguage?.code !== 'fa' ? 'ltr' : 'rtl';
        this.direction = document.documentElement.dir;

        const bootstrapRTL = document.getElementById('bootstrapRTL') as HTMLLinkElement;
        bootstrapRTL.disabled = document.documentElement.dir !== 'rtl';
        this.onFontSelect(this.userObj?.preferedFont);
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
    this.getCities(code).then(async data => {
      if (data.data) {
        this.cities = data.data.sort((a: any, b: any) => a.localeCompare(b));
        // Load the initial country list
        this.filteredCities = this.cities;

        // Listen for search field value changes
        this.cityFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterCities();
          });
      }
    });
  }

  private filterCities() {
    const search = this.cityFilterCtrl.value ? this.cityFilterCtrl.value.toLowerCase() : '';
    this.filteredCities = this.cities
      .filter((city: any) =>
        city.replace(/`/g, '').toLowerCase().includes(search)
      );
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

  async shareData(data: any) {
    try {
      await navigator.share(data);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  }

  canBrowserShareData(data: any) {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }
    return navigator.canShare(data);
  }

  share(obj: any) {
    const sharedData = obj;
    if (this.canBrowserShareData(sharedData)) {
      this.shareData(sharedData);
    } else {
      // copy to clipboard
      navigator.clipboard.writeText(sharedData.text);
      alert("Copied to clipboard!");
    }
  }

  onFontSelect(font: any) {
    const body = document.body;
    body.classList.remove('anjoman-font', 'anjoman-font-en', 'dana-font', 'dana-font-en',
      'IRANSans-font', 'IRANSans-font-en', 'modam-font', 'modam-font-en'); // Remove previous font classes
    switch (font) {
      case 'Anjoman':
        this.userObj?.preferedLanguage?.code == 'fa' ? body.classList.add('anjoman-font') : body.classList.add('anjoman-font-en'); // Apply Farsi font
        break;
      case 'Dana':
        this.userObj?.preferedLanguage?.code == 'fa' ? body.classList.add('dana-font') : body.classList.add('dana-font-en'); // Apply Farsi font
        break;
      case 'IRANSans':
        this.userObj?.preferedLanguage?.code == 'fa' ? body.classList.add('IRANSans-font') : body.classList.add('IRANSans-font-en'); // Apply Farsi font
        break;
      case 'Modam':
        this.userObj?.preferedLanguage?.code == 'fa' ? body.classList.add('modam-font') : body.classList.add('modam-font-en'); // Apply Farsi font
        break;
      default:
    }
  }
}

