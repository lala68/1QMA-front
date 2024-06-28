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
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";
import {GeneralService} from "../../services/general/general.service";
import {ConfigService} from "../../services/config/config.service";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, RouterModule, MaterialModule,
    NgxMatIntlTelInputComponent, TranslateModule, CountdownTimerComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  providers: [CountdownTimerComponent]
})
export class SignupComponent {
  loading$ = this.loader.isLoading$;
  loading: boolean = false;
  signUpReferralForm = this._formBuilder.group({
    referer: new FormControl('', [Validators.required]),
  });
  signUpWaitListForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    mobile: new FormControl('', [Validators.required, Validators.minLength(10)]),
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
  resendAblePhone = false;
  resendAbleEmail = false;
  loadingCodeEmail = false;
  loadingCodePhone = false;
  error: any;
  errorWaitList: any;
  email: any;
  emailVerified: boolean = false;
  phoneVerified: boolean = false;

  constructor(private _formBuilder: FormBuilder, private loader: LoaderService, private router: Router,
              public authService: AuthService, private generalService: GeneralService, public config: ConfigService) {
    this.email = this.router.getCurrentNavigation()?.extras?.state?.['email'] ? this.router.getCurrentNavigation()?.extras?.state?.['email'] : '';
    if (this.email) {
      this.signUpWaitListForm.controls.email.setValue(this.email);
      this.signUpWaitListForm.controls.email.disable();
    }
  }

  onSubmit() {
    this.error = '';
    this.errorWaitList = '';
    this.loading = true;
    this.authService.signupWithReferral(this.signUpReferralForm.value).then(async data => {
      this.loading = false;
      if (data?.status == 1) {
        await Preferences.set({key: 'account', value: JSON.stringify(data.data.user)});
        await Preferences.set({key: 'accessToken', value: data.data.token});
        this.generalService.userId = data.data?._id;
        this.generalService.token = data.data?.token;
        await this.router.navigate(['signup-refer-email']);
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
    this.authService.joinToWaitListWithEmailAndMobile(this.signUpWaitListForm.getRawValue()).then(data => {
      this.loading = false;
      if (data?.status == 1) {
        this.step = 2;
        this.signUpVerifyFormMobile.controls.mobile.setValue(this.signUpWaitListForm.controls.mobile.value);
        this.signUpVerifyFormMobile.controls.mobile.disable();
        this.signUpVerifyFormEmail.controls.email.setValue(this.signUpWaitListForm.controls.email.value);
        this.signUpVerifyFormEmail.controls.email.disable();
      } else if (data?.status == -1) {
        this.errorWaitList = data?.message;
      }
    })
  }

  onSubmitSignUpVerify() {
    this.error = '';
    this.authService.verifyEmail(this.signUpVerifyFormEmail.getRawValue()).then(data => {
      if (data?.status == 1) {
        this.emailVerified = true
      } else {
        this.error = data?.message;
      }
    });
    this.authService.verifyMobile(this.signUpVerifyFormMobile.getRawValue()).then(data => {
      if (data?.status == 1) {
        this.phoneVerified = true
      } else {
        this.error = data?.message
      }
    });
    setTimeout(() => {
      if (this.phoneVerified && this.emailVerified)
        this.step = 3;
    }, 1000)

  }

  handleCountdownFinishedEmail() {
    this.resendAbleEmail = true;
  }

  handleCountdownFinishedMobile() {
    this.resendAblePhone = true;
  }

  async resendCodeEmail() {
    this.resendAbleEmail = false;
    this.authService.resendCodeEmail(this.signUpVerifyFormEmail.controls.email.value).then(data => {

    })
  }

  async resendCodePhone() {
    this.resendAblePhone = false;
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

  async gotoSignup() {
    await this.router.navigate(['signup-social'], {state: {email: this.generalService.generateRandomEmail()}});
  }
}
