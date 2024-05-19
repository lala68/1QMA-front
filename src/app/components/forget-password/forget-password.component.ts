import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {Router, RouterModule} from "@angular/router";
import {MaterialModule} from "../../shared/material/material.module";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {TranslateModule} from "@ngx-translate/core";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, RouterModule, MaterialModule,
    NgxMatIntlTelInputComponent, TranslateModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  step: any = 1;
  type: any;
  loading: boolean = false;
  resetPasswordForm = this._formBuilder.group({
    verificationCode: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    passwordConfirmation: new FormControl('', [Validators.required]),
  });

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);

  phoneFormControl = new FormControl('', [
    Validators.required,
  ]);
  error: any;

  constructor(private _formBuilder: FormBuilder, private router: Router,
              private authService: AuthService) {
  }

  gotoStepTwo(type: any) {
    this.step = 2;
    this.type = type;
  }

  gotoStepThree() {
    this.loading = true;
    this.error = '';
    if (this.type == 'email') {
      this.authService.forgetPasswordEmail(this.emailFormControl.value).then(data => {
        this.loading = false;
        console.log(data?.message)
        if (data?.status == 1) {
          this.step = 3;
        } else if (data?.status == -1) {
          this.error = data?.message;
        }
      })
    } else {
      this.authService.forgetPasswordMobile(this.phoneFormControl.value).then(data => {
        this.loading = false;
        if (data?.status == 1) {
          this.step = 3;
        } else if (data?.status == -1) {
          this.error = data?.message;
        }
      })
    }
  }

  onSubmit() {
    this.error = '';
    this.loading = true;
    if (this.type == 'email') {
      this.authService.updatePasswordEmail(this.resetPasswordForm.value, this.emailFormControl.value).then(data => {
        this.loading = false;
        if (data?.status == 1) {
          this.step = 4;
        } else if (data?.status == -1) {
          this.error = data?.message;
        }
      })
    } else {
      this.authService.updatePasswordMobile(this.resetPasswordForm.value, this.phoneFormControl.value).then(data => {
        this.loading = false;
        if (data?.status == 1) {
          this.step = 4;
        } else if (data?.status == -1) {
          this.error = data?.message;
        }
      })
    }
  }

  countryChangedEvent(event: any) {

  }

  async prevStep() {
    this.error = '';
    if (this.step === 1) {
      await this.router.navigateByUrl('/login');
    } else {
      if (this.step === 2) {
        this.emailFormControl.reset()
        this.phoneFormControl.reset()
      }
      --this.step;
    }
  }


}
