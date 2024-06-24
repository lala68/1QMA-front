import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {ConfigService} from "../config/config.service";
import {map} from "rxjs";
import {Preferences} from "@capacitor/preferences";
import {GeneralService} from "../general/general.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isLoggedIn: any = false;

  constructor(private http: HttpClient, private generalService: GeneralService,
              private config: ConfigService, private router: Router) {
  }

  async loginWithEmail(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/loginWithEmail'), data, {headers: headers})
      .toPromise();
  }

  async signupWithReferral(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/registerWithReferal'), data, {headers: headers})
      .toPromise();
  }

  async joinToWaitListWithEmailAndMobile(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/joinToWaitListWithEmailAndMobile'), data, {headers: headers})
      .toPromise();
  }

  async joinToWaitListWithMobile(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/joinToWaitListWithMobile'), data, {headers: headers})
      .toPromise();
  }

  async setEmail(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/setEmail'), {
      id: this.generalService.userId,
      email: data
    }, {headers: headers})
      .toPromise();
  }

  async setReferPassword(email: any, data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/setPassword'), {
      id: this.generalService.userId,
      email: email,
      verificationCode: data?.verificationCode,
      password: data?.password,
      passwordConfirmation: data?.passwordConfirmation
    }, {headers: headers})
      .toPromise();
  }

  async verifyEmail(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/verify/email'), data, {headers: headers})
      .toPromise();
  }

  async verifyMobile(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/verify/mobile'), data, {headers: headers})
      .toPromise();
  }

  async forgetPasswordMobile(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/forgotPassword/mobile'), {mobile: data}, {headers: headers})
      .toPromise();
  }

  async forgetPasswordEmail(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/forgotPassword/email'), {email: data}, {headers: headers})
      .toPromise();
  }

  async updatePasswordMobile(data: any, mobile: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/updatePassword/mobile'), {
      ...data,
      mobile: mobile
    }, {headers: headers})
      .toPromise();
  }

  async updatePasswordEmail(data: any, email: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/updatePassword/email'), {
      ...data,
      email: email
    }, {headers: headers})
      .toPromise();
  }

  async resendCodeEmail(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/email/resend'), data, {headers: headers})
      .toPromise();
  }

  async resendCodeMobile(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/mobile/resend'), data, {headers: headers})
      .toPromise();
  }

  async updateProfile(data: any, userId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/updateProfile'), {id: userId, ...data}, {headers: headers})
      .toPromise();
  }

  async registerInit(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    const response = this.http.get(this.config.url('auth/register/init'), {
      headers: headers
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async updateCategoryPreferences(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/updateCategoryPreferences'), {
      id: this.generalService.userId,
      categories: data
    }, {headers: headers})
      .toPromise();
  }

  async updateAccountType(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/updateAccountType'), {
      id: this.generalService.userId,
      accountType: data
    }, {headers: headers})
      .toPromise();
  }

  async updateLanguage(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/updateLanguagePreference'), {
      id: this.generalService.userId,
      language: data
    }, {headers: headers})
      .toPromise();
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await Preferences.get({key: 'account'});
    console.log(user)
    if (user.value != null) {
      const userObj = JSON.parse(user.value);
      this.isLoggedIn = true;
      console.log(userObj)
      if (userObj?._id) {
        this.generalService.userId = userObj._id;
      } else {
        this.generalService.userId = '66';
      }
      if (userObj.hasCompletedSignup) {
        this.generalService.hasCompletedSignup = userObj.hasCompletedSignup;
      } else {
        this.generalService.hasCompletedSignup = false;
      }
    }
    return !!user.value;
  }

  async signout(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Access-Token': this.generalService.token
    })
    return this.http.post<any>(this.config.url('auth/signout'), {id: this.generalService.userId}, {headers: headers})
      .toPromise();
  }

}
