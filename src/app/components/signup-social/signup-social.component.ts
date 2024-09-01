import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {Router, RouterModule} from "@angular/router";
import {MaterialModule} from "../../shared/material/material.module";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {TranslateModule} from "@ngx-translate/core";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";
import {GeneralService} from "../../services/general/general.service";

@Component({
  selector: 'app-signup-social',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, RouterModule, MaterialModule,
    NgxMatIntlTelInputComponent, TranslateModule, CountdownTimerComponent],
  templateUrl: './signup-social.component.html',
  styleUrl: './signup-social.component.scss',
  providers: [CountdownTimerComponent]
})
export class SignupSocialComponent {
  signUpWaitListForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
    mobile: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });
  signUpVerifyFormMobile = this._formBuilder.group({
    mobile: new FormControl('', [Validators.required]),
    verificationCode: new FormControl('', [Validators.required]),
  });
  step: any = 1;
  errorWaitList: any;
  loading: boolean = false;
  email: any;
  resendAblePhone = false;

  constructor(private _formBuilder: FormBuilder, public authService: AuthService, private router: Router,
              public generalService: GeneralService) {
    this.email = this.router.getCurrentNavigation()?.extras?.state?.['email'] ? this.router.getCurrentNavigation()?.extras?.state?.['email'] : '';
    if (this.email) {
      this.signUpWaitListForm.controls.email.setValue(this.email);
      this.signUpWaitListForm.controls.email.disable();
    } else {
      this.router.navigate(['/login'])
    }
  }

  onSubmitSignUpWaitList() {
    this.errorWaitList = '';
    this.loading = true;
    this.authService.joinToWaitListWithMobile(this.signUpWaitListForm.getRawValue()).then(data => {
      this.loading = false;
      if (data?.status == 1) {
        this.step = 2;
        this.signUpVerifyFormMobile.controls.mobile.setValue(this.signUpWaitListForm.controls.mobile.value);
        this.signUpVerifyFormMobile.controls.mobile.disable();
      } else if (data?.status == -1) {
        this.errorWaitList = data?.message;
      }
    })
  }

  onSubmitSignUpVerify() {
    this.loading = true;
    this.authService.verifyMobile(this.signUpVerifyFormMobile.getRawValue()).then(data => {
      if (data?.status == 1) {
        this.step = 3;
      }
    });
  }

  handleCountdownFinishedMobile() {
    this.resendAblePhone = true;
  }

  async resendCodePhone() {
    this.resendAblePhone = false;
    this.authService.resendCodeMobile(this.signUpVerifyFormMobile.controls.mobile.value).then(data => {

    })
  }

  async prevStep() {
    if (this.step === 1) {
      await this.router.navigateByUrl('/signup');
    } else {
      --this.step;
    }
  }
}
