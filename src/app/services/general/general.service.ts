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

  googleTranslateElementInit(lang: any): void {
    this.setCookie('googtrans', '/en/' + lang, 10);
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    }, 'google_translate_element');
  }

  setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
  }

  loadGoogleTranslateScript(retryCount = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      const maxRetries = 10;
      const existingScript = document.getElementById('google-translate-script');

      // if (existingScript) {
      //   console.log('Google Translate script is already loaded.');
      //   resolve();
      //   return;
      // }

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = "assets/js/element.js";  // Use the local file

      script.onload = () => {
        console.log('Google Translate script loaded successfully.');
        resolve();
      };

      script.onerror = () => {
        if (retryCount < maxRetries) {
          console.warn(`Retrying to load Google Translate script (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            this.loadGoogleTranslateScript(retryCount + 1).then(resolve).catch(reject);
          }, 3000);
        } else {
          console.error('Failed to load Google Translate script after multiple attempts.');
          reject(new Error('Failed to load Google Translate script after multiple attempts.'));
        }
      };

      document.body.appendChild(script);
    });
  }

  waitForGoogleTranslate(retryCount = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      const maxRetries = 20; // Increase retries to account for slower initialization
      const delay = 300; // Delay between retries in milliseconds

      if (typeof google !== 'undefined' && google.translate && google.translate.TranslateElement) {
        resolve(); // Resolve when the object is available
      } else if (retryCount < maxRetries) {
        setTimeout(() => {
          console.warn(`Waiting for Google Translate to initialize (${retryCount + 1}/${maxRetries})`);
          this.waitForGoogleTranslate(retryCount + 1).then(resolve).catch(reject);
        }, delay);
      } else {
        reject(new Error('Google Translate failed to initialize after multiple attempts.'));
      }
    });
  }

  useGoogleTranslate() {
    const targetLanguage = this.userObj?.preferedLanguage == '0' ? 'en' :
      this.userObj?.preferedLanguage == '1' ? 'de' : 'fa';

    // Set the cookie to change the language
    this.setCookie('googtrans', '/en/' + targetLanguage, 10);

    this.loadGoogleTranslateScript(0).then(() => {
      this.waitForGoogleTranslate().then(() => {
        // Reinitialize Google Translate with the new language
        this.googleTranslateElementInit(targetLanguage);

        // Simulate a language change event to force Google Translate to refresh
        const selectElement = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
        if (selectElement) {
          selectElement.value = targetLanguage;
          selectElement.dispatchEvent(new Event('change'));
        }
      }).catch((err) => {
        console.error('Google Translate failed to initialize.', err);
      });
    }).catch((err) => {
      console.error('Google Translate script failed to load.', err);
    });
  }
}

declare namespace google {
  namespace translate {
    class TranslateElement {
      constructor(options: TranslateElementOptions, element: string | HTMLElement);

      static InlineLayout: {
        SIMPLE: any;
        VERTICAL: any;
      };
    }

    interface TranslateElementOptions {
      pageLanguage: string;
      layout?: any;
      autoDisplay?: boolean;
    }
  }
}
