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
    return this.http.post<any>(this.config.url('auth/loginWithEmail'), data, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async signupWithReferral(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    return this.http.post<any>(this.config.url('auth/registerWithReferal'), data, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async joinToWaitListWithEmailAndMobile(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/joinToWaitListWithEmailAndMobile'), data, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async joinToWaitListWithMobile(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/joinToWaitListWithMobile'), data, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async setEmail(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/setEmail'), {
      id: this.generalService.userId,
      email: data
    }, {
      headers: headers,
      withCredentials: true
    })
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
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async verifyEmail(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('auth/verify/email'), data, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async verifyMobile(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('auth/verify/mobile'), data, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async forgetPasswordMobile(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/forgotPassword/mobile'), {mobile: data}, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async forgetPasswordEmail(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/forgotPassword/email'), {email: data}, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async updatePasswordMobile(data: any, mobile: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/updatePassword/mobile'), {
      ...data,
      mobile: mobile
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async updatePasswordEmail(data: any, email: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/updatePassword/email'), {
      ...data,
      email: email
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async resendCodeEmail(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/email/resend'), data, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async resendCodeMobile(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.config.url('auth/mobile/resend'), data, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async updateProfile(data: any, userId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('auth/updateProfile'), {id: userId, ...data}, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async registerInit(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    const response = this.http.get(this.config.url('auth/register/init'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async updateCategoryPreferences(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('auth/updateCategoryPreferences'), {
      id: this.generalService.userId,
      categories: data
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async updateAccountType(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('auth/updateAccountType'), {
      id: this.generalService.userId,
      accountType: data
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async updateLanguage(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    return this.http.post<any>(this.config.url('auth/updateLanguagePreference'), {
      id: this.generalService.userId,
      language: data,
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await Preferences.get({key: 'account'});
    console.log(user)
    if (user.value != null) {
      try {
        var testIfJson = JSON.parse(user.value);
        if (typeof testIfJson == "object") {
          //Json
          this.generalService.userObj = JSON.parse(user.value);
          this.generalService.userId = this.generalService.userObj._id;
          this.isLoggedIn = true;
          this.generalService.hasCompletedSignup = this.generalService.userObj?.hasCompletedSignup;
        } else {
          //Not Json
          this.generalService.userObj = (user.value);
          this.generalService.userId = this.generalService.userObj._id;
          this.isLoggedIn = true;
          this.generalService.hasCompletedSignup = this.generalService.userObj?.hasCompletedSignup;
        }
      } catch {
        this.generalService.userObj = (user.value);
        this.generalService.userId = this.generalService.userObj._id;
      }
    }
    return !!user.value;
  }

  async signout(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('auth/logout'), {id: this.generalService.userId}, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async getUserDetails(id: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    const response = this.http.get(this.config.url('auth/' + id + '/details'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

}
