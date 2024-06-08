import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoaderService} from "../../services/loader/loader.service";
import {AuthService} from "../../services/auth/auth.service";
import {Router, RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {MaterialModule} from "../../shared/material/material.module";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";

@Component({
  selector: 'app-signup-refer-email',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, RouterModule, MaterialModule,
    NgxMatIntlTelInputComponent, TranslateModule],
  templateUrl: './signup-refer-email.component.html',
  styleUrl: './signup-refer-email.component.scss'
})
export class SignupReferEmailComponent {
  signUpEmailForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  setPasswordForm = this._formBuilder.group({
    verificationCode: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    passwordConfirmation: new FormControl('', [Validators.required]),
  });
  step: any = 1;
  loading$ = this.loader.isLoading$;
  loading: boolean = false;
  error: any;
  hideCopy = true;
  hide = true;

  constructor(private _formBuilder: FormBuilder, private loader: LoaderService, private router: Router,
              public authService: AuthService, private generalService: GeneralService) {
  }

  async onSubmitEmail() {
    this.error = '';
    this.authService.resendCodeEmail(this.signUpEmailForm.value).then(data => {
      if (data.status == 1) {
        this.step = 2;
      } else {
        this.error = data.message;
      }
    })
  }

  async gotoWizard() {
    await this.router.navigate(['/wizard'], {state: {email: this.generalService.generateRandomEmail()}});
  }

  async onSubmitPassword() {
    await this.router.navigate(['/wizard'], {state: {email: this.signUpEmailForm.controls.email.value}});
  }
}
