import {Component, CUSTOM_ELEMENTS_SCHEMA, Inject, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoaderService} from "../../services/loader/loader.service";
import {AuthService} from "../../services/auth/auth.service";
import {SharedModule} from "../../shared/shared.module";
import {CommonModule} from "@angular/common";
import {Router, RouterModule} from "@angular/router";
import {MaterialModule} from "../../shared/material/material.module";
import {TranslateModule} from "@ngx-translate/core";
import {Preferences} from "@capacitor/preferences";
import {GeneralService} from "../../services/general/general.service";
import {MatStepper} from "@angular/material/stepper";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";
import {ClientService} from "../../services/client/client.service";
import {ConfigService} from "../../services/config/config.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, RouterModule, MaterialModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent {
  loading$ = this.loader.isLoading$;
  loading: boolean = false;
  loginForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });
  error: any;
  hide = true;

  constructor(private _formBuilder: FormBuilder, private loader: LoaderService, private clientService: ClientService,
              public authService: AuthService, private router: Router, private generalService: GeneralService,
              public config: ConfigService) {
  }

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.authService.loginWithEmail(this.loginForm.value).then(async data => {
      this.loading = false;
      if (data?.status == 1) {
        await Preferences.set({key: 'account', value: JSON.stringify(data.data.user)});
        await this.authService.isAuthenticated();
        await this.generalService.getUserData();
        if (this.generalService.userId && !this.generalService.hasCompletedSignup) {
          await this.router.navigate(['/wizard']);
          this.authService.registerInit().then(res => {
            if (res.status == 1) {
              this.generalService.initData = res.data;
            }
          })
        } else if (this.generalService.userId && this.generalService.hasCompletedSignup) {
          await this.router.navigate(['/dashboard']);
          this.clientService.clientInit().then(res => {
            if (res.status == 1) {
              this.generalService.clientInit = res.data;
              this.generalService.currentRout = '/dashboard';
            }
          })
        }
      } else if (data?.status == -1) {
        this.error = data?.message;
      }

    })
  }

  async gotoDashboard() {
    // await this.router.navigate(['signup'], {state: {email: 'test@test.com'}});
    this.generalService.currentRout = '/dashboard';
    await this.router.navigate(['/dashboard']);
  }

}
