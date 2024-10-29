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
import {io} from "socket.io-client";
import {GamesService} from "../../services/games/games.service";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {MatSnackBar} from "@angular/material/snack-bar";

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
    email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
    password: new FormControl('', [Validators.required]),
  });
  hide = true;

  constructor(private _formBuilder: FormBuilder, private loader: LoaderService, private clientService: ClientService,
              public authService: AuthService, private router: Router, public generalService: GeneralService,
              public config: ConfigService, private gameService: GamesService, private _snackBar: MatSnackBar) {
  }

  onSubmit() {
    this.loading = true;
    this.authService.loginWithEmail(this.loginForm.value).then(async data => {
      this.loading = false;
      if (data?.status == 1) {
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
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
          if (this.generalService.userObj.hasSeenIntros.tutorial) {
            if (this.generalService.userObj?.defaultHomePage == '/games') {
              await this.router.navigate(['/games/overview']);
              this.generalService.currentRout = '/games/overview';
            } else {
              await this.router.navigate([this.generalService.userObj?.defaultHomePage]);
              this.generalService.currentRout = this.generalService.userObj?.defaultHomePage;
            }
            this.clientService.clientInit().then(async res => {
              if (res.status == 1) {
                this.generalService.clientInit = res.data;
                await Preferences.remove({key: 'account'});
                await Preferences.set({key: 'account', value: JSON.stringify(res.data.user)});
              }
            });
            this.gameService.gameInit().then(data => {
              if (data.status == 1) {
                this.generalService.gameInit = data.data;
              }
            });
          } else {
            await this.router.navigate(['/tutorial']);
            this.clientService.clientInit().then(async res => {
              if (res.status == 1) {
                this.generalService.clientInit = res.data;
                await Preferences.remove({key: 'account'});
                await Preferences.set({key: 'account', value: JSON.stringify(res.data.user)});
                this.generalService.currentRout = '';
              }
            });
            this.gameService.gameInit().then(data => {
              if (data.status == 1) {
                this.generalService.gameInit = data.data;
              }
            });
          }
        }
      } else if (data?.status == -1) {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    })
  }

  openDialog(message: any, title: any) {
    this._snackBar.openFromComponent(SnackbarContentComponent, {
      data: {
        title: title,
        message: message
      },
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: title == 'Success' ? 'app-notification-success' : 'app-notification-error'
    });
  }

}
