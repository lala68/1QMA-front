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
import {ConfigService} from "../../services/config/config.service";
import {Preferences} from "@capacitor/preferences";

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
    email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
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
  email: any;
  invitationId: any;

  constructor(private _formBuilder: FormBuilder, private loader: LoaderService, private router: Router,
              public authService: AuthService, public generalService: GeneralService, public config: ConfigService) {
    this.email = this.router.getCurrentNavigation()?.extras?.state?.['email'] ? this.router.getCurrentNavigation()?.extras?.state?.['email'] : '';
    this.invitationId = this.router.getCurrentNavigation()?.extras?.state?.['invitationId'] ? this.router.getCurrentNavigation()?.extras?.state?.['invitationId'] : '';
    if (this.email) {
      this.signUpEmailForm.controls.email.setValue(this.email);
      // Make the input field readonly instead of disabling it
      this.signUpEmailForm.controls.email.disable({onlySelf: true, emitEvent: false});
      setTimeout(() => this.signUpEmailForm.controls.email.enable(), 0); // Re-enable form control but make the input readonly

    }
  }

  async onSubmitEmail() {
    this.error = '';
    this.loading = true;
    this.authService.setEmail(this.signUpEmailForm.controls.email.value, this.invitationId).then(data => {
      this.loading = false;
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
    this.loading = true;
    this.error = '';
    this.authService.setReferPassword(this.signUpEmailForm.controls.email.value, this.setPasswordForm.value).then(async data => {
      this.loading = false;
      if (data.status == 1) {
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        await this.router.navigate(['/wizard'], {state: {email: this.signUpEmailForm.controls.email.value}});
        this.authService.registerInit().then(res => {
          if (res.status == 1) {
            this.generalService.initData = res.data;
          }
        })
      } else {
        this.error = data.message;
      }
    })
  }

  async prevStep() {
    this.error = '';
    if (this.step === 1) {
      await this.router.navigateByUrl('/signup');
    } else {
        --this.step;
    }
  }
}
