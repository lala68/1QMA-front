import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoaderService} from "../../services/loader/loader.service";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {RouterModule} from "@angular/router";
import {MaterialModule} from "../../shared/material/material.module";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, RouterModule, MaterialModule, NgxMatIntlTelInputComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  loading$ = this.loader.isLoading$;
  loading: boolean = false;
  signUpReferralForm = this._formBuilder.group({
    referral: new FormControl('', [Validators.required]),
  });
  signUpWaitListForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
  });
  signUpVerifyForm = this._formBuilder.group({
    phoneCode: new FormControl('', [Validators.required]),
    emailCode: new FormControl('', [Validators.required]),
  });
  email: any;
  phone: any;
  step: any = 1;
  countDownPhone = 10;
  countDownEmail = 10;
  resendAblePhone = false;
  resendAbleEmail = false;
  intervalIdEmail: any;
  intervalIdPhone: any;
  loadingCodeEmail = false;
  loadingCodePhone = false;

  constructor(private _formBuilder: FormBuilder, private loader: LoaderService,) {
  }

  onSubmit() {

  }

  countryChangedEvent(event: any) {

  }

  onSubmitSignUpWaitList() {
    this.step = 2;
    this.countDownEmail = 10;
    this.countDownPhone = 10;
    clearInterval(this.intervalIdEmail);
    clearInterval(this.countDownPhone);
    this.startTimerEmail();
    this.startTimerPhone();
  }

  onSubmitSignUpVerify() {
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
  }

  async resendCodePhone() {
    this.resendAblePhone = false;
  }
}
