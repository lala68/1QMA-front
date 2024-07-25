import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {register} from 'swiper/element/bundle';
import {TranslateService} from "@ngx-translate/core";
import {GeneralService} from "./services/general/general.service";
import {AuthService} from "./services/auth/auth.service";
import {ClientService} from "./services/client/client.service";
import {Preferences} from "@capacitor/preferences";
import {Location} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "./components/snackbar-content/snackbar-content.component";
import {io} from "socket.io-client";

register();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = '1QMA';

  constructor(private router: Router, private translateService: TranslateService, private _snackBar: MatSnackBar,
              private generalService: GeneralService, private authService: AuthService, public dialog: MatDialog,
              private clientService: ClientService, private route: ActivatedRoute, private location: Location) {
    this.translateService.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.starter().then(async (data) => {
      this.generalService.socket = io('https://api.staging.1qma.games', {withCredentials: true});
      this.generalService.socket.on("connect", () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
        console.log("connect" + ' ' + `[${timeString}]`);
        if (this.generalService.disconnectedModal) {
          this.generalService.disconnectedModal.close();
          this.generalService.disconnectedModal = '';
        }
      });
      this.route.queryParams.subscribe(async params => {
        console.log(params)
        await this.generalService.getUserData();
        const status = params['status'];
        const user_id = params['user_id'];
        const message = params['message'];
        if (status == 1) {
          if (user_id) {
            await Preferences.set({key: 'account', value: JSON.stringify({_id: user_id})});
          }
          await this.authService.isAuthenticated();
          await this.generalService.getUserData();
          // await this.router.navigate(['wizard'], {state: {email: email}});
          this.authService.getUserDetails(this.generalService.userId).then(async user => {
            await Preferences.set({key: 'account', value: JSON.stringify(user.data)});
            if (user.data.hasCompletedSignup) {
              this.router.navigate(['/dashboard']);
            } else {
              this.authService.registerInit().then(res => {
                if (res.status == 1) {
                  this.generalService.initData = res.data;
                  this.router.navigate(['/wizard']);
                }
              })
            }
          })
        } else if (status == -1) {
          this.openDialog(JSON.stringify(message), 'Error');
          return;
        } else {
          if (this.generalService.userId && !this.generalService.hasCompletedSignup) {
            this.authService.getUserDetails(this.generalService.userId).then(async user => {
              await Preferences.set({key: 'account', value: JSON.stringify(user.data)});
              if (user.data.hasCompletedSignup) {
                this.router.navigate(['/dashboard']);
              } else {
                this.authService.registerInit().then(res => {
                  if (res.status == 1) {
                    this.generalService.initData = res.data;
                    this.router.navigate(['/wizard']);
                  }
                })
              }
            })
          } else if (this.generalService.userId && this.generalService.hasCompletedSignup) {
            this.clientService.clientInit().then(data => {
              this.generalService.clientInit = data.data;
            });
            this.router.navigate([(this.router.url === ('/login') || this.router.url === ('/signup') || this.router.url === ('/forget-password')
              || this.router.url === ('/wizard') || this.router.url === ('/signup-social') || this.router.url === ('/signup-refer-email')
              || this.router.url === ('/social/callback')) ? '/dashboard' : this.location.path()]);
            this.generalService.currentRout = this.router.url;
          }
        }
      })
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

  async starter() {
    if (await this.authService.isAuthenticated()) {
      await this.generalService.getUserData();
    }
  }
}
