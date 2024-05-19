import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoaderService} from "../../services/loader/loader.service";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {Router, RouterModule} from "@angular/router";
import {MaterialModule} from "../../shared/material/material.module";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {TranslateModule} from "@ngx-translate/core";
import {AuthService} from "../../services/auth/auth.service";
import {Preferences} from "@capacitor/preferences";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, RouterModule, MaterialModule,
    NgxMatIntlTelInputComponent, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  loading$ = this.loader.isLoading$;
  loading: boolean = false;
  signUpReferralForm = this._formBuilder.group({
    referer: new FormControl('', [Validators.required]),
  });
  signUpWaitListForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    mobile: new FormControl('', [Validators.required]),
  });
  signUpVerifyFormEmail = this._formBuilder.group({
    email: new FormControl('', [Validators.required]),
    verificationCode: new FormControl('', [Validators.required]),
  });
  signUpVerifyFormMobile = this._formBuilder.group({
    mobile: new FormControl('', [Validators.required]),
    verificationCode: new FormControl('', [Validators.required]),
  });
  step: any = 1;
  countDownPhone = 10;
  countDownEmail = 10;
  resendAblePhone = false;
  resendAbleEmail = false;
  intervalIdEmail: any;
  intervalIdPhone: any;
  loadingCodeEmail = false;
  loadingCodePhone = false;
  error: any;
  errorWaitList: any;

  constructor(private _formBuilder: FormBuilder, private loader: LoaderService, private router: Router,
              public authService: AuthService) {
  }

  onSubmit() {
    this.error = '';
    this.errorWaitList = '';
    this.loading = true;
    this.authService.signupWithReferral(this.signUpReferralForm.value).then(async data => {
      this.loading = false;
      if (data?.status == 1) {
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.router.navigate(['wizard']);
      } else if (data?.status == -1) {
        this.error = data?.message;
      }
    })
  }

  countryChangedEvent(event: any) {

  }

  onSubmitSignUpWaitList() {
    this.error = '';
    this.errorWaitList = '';
    this.loading = true;
    this.authService.joinToWaitList(this.signUpWaitListForm.value).then(data => {
      this.loading = false;
      if (data?.status == 1) {
        this.step = 2;
        this.countDownEmail = 10;
        this.countDownPhone = 10;
        clearInterval(this.intervalIdEmail);
        clearInterval(this.countDownPhone);
        this.startTimerEmail();
        this.startTimerPhone();
        this.signUpVerifyFormMobile.controls.mobile.setValue(this.signUpWaitListForm.controls.mobile.value);
        this.signUpVerifyFormEmail.controls.email.setValue(this.signUpWaitListForm.controls.email.value);
      } else if (data?.status == -1) {
        this.errorWaitList = data?.message;
      }
    })
  }

  onSubmitSignUpVerify() {
    this.authService.verifyEmail(this.signUpVerifyFormEmail.value).then(data => {

    });
    this.authService.verifyMobile(this.signUpVerifyFormMobile.value).then(data => {

    });
    this.step = 3;
  }

  startTimerEmail() {
    this.intervalIdEmail = setInterval(() => {
      if (this.countDownEmail > 0) {
        this.countDownEmail -= 1;
      } else {
        this.countDownEmail = 10;
        this.resendAbleEmail = true;
        this.loadingCodeEmail = false;
        clearInterval(this.intervalIdEmail);
      }
    }, 1000);
  }

  startTimerPhone() {
    this.intervalIdPhone = setInterval(() => {
      if (this.countDownPhone > 0) {
        this.countDownPhone -= 1;
      } else {
        this.countDownPhone = 10;
        this.resendAblePhone = true;
        this.loadingCodePhone = false;
        clearInterval(this.intervalIdPhone);
      }
    }, 1000);
  }

  async resendCodeEmail() {
    this.resendAbleEmail = false;
    this.startTimerEmail();
    this.authService.resendCodeEmail(this.signUpVerifyFormEmail.controls.email.value).then(data => {

    })
  }

  async resendCodePhone() {
    this.resendAblePhone = false;
    this.startTimerPhone();
    this.authService.resendCodeMobile(this.signUpVerifyFormMobile.controls.mobile.value).then(data => {

    })
  }

  async prevStep() {
    if (this.step === 1) {
      await this.router.navigateByUrl('/login');
    } else {
      --this.step;
    }
  }
}
