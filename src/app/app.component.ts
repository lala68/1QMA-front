import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {register} from 'swiper/element/bundle';
import {TranslateService} from "@ngx-translate/core";
import {GeneralService} from "./services/general/general.service";
import {AuthService} from "./services/auth/auth.service";
import {ClientService} from "./services/client/client.service";
import {Preferences} from "@capacitor/preferences";
import {Location} from "@angular/common";
import {DialogContentComponent} from "./components/dialog-content/dialog-content.component";
import {MatDialog} from "@angular/material/dialog";

register();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = '1QMA';

  constructor(private router: Router, private translateService: TranslateService,
              private generalService: GeneralService, private authService: AuthService, public dialog: MatDialog,
              private clientService: ClientService, private route: ActivatedRoute, private location: Location) {
    this.translateService.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.starter().then(async (data) => {
      this.route.queryParams.subscribe(async params => {
        console.log(params)
        await this.generalService.getUserData();
        const status = params['status'];
        const provider_id = params['provider_id'];
        const user_id = params['user_id'];
        const email = params['email'];
        const message = params['message'];
        const token = params['token'];
        alert("provider_id: " + provider_id)
        alert("status: " + status)
        if (status == 1) {
          if (provider_id) {
            await Preferences.set({key: 'provider', value: JSON.stringify({provider_id: provider_id, email: email})});
          }
          if (user_id) {
            await Preferences.set({key: 'account', value: JSON.stringify({_id: user_id})});
          }
          if (token) {
            await Preferences.set({key: 'accessToken', value: token});
          }
          this.authService.registerInit().then(async res => {
            if (res.status == 1) {
              this.generalService.initData = res.data;
              await this.authService.isAuthenticated();
              await this.generalService.getUserData();
              await this.router.navigate(['wizard'], {state: {email: email}});
            }
          })
        } else if (status == -1) {
          alert('error');
          alert(this.location.path())
          this.openDialog(JSON.stringify(message), 'Error');
          return;
        } else {
          alert('else')
          if (this.generalService.userId && !this.generalService.hasCompletedSignup) {
            alert(1)
            this.authService.registerInit().then(res => {
              if (res.status == 1) {
                this.generalService.initData = res.data;
                this.router.navigate(['/wizard']);
              }
            })
          } else if (this.generalService.userId && this.generalService.hasCompletedSignup) {
            alert(2)
            this.clientService.clientInit().then(data => {
              this.generalService.clientInit = data.data;
            });
            this.router.navigate([(this.router.url === ('/login') || this.router.url === ('/signup') || this.router.url === ('/forget-password')
              || this.router.url === ('/wizard') || this.router.url === ('/signup-social') || this.router.url === ('/signup-refer-email')
              || this.router.url === ('/social/callback')) ? '/dashboard' : this.location.path()]);
            this.generalService.currentRout = this.router.url;
          } else if (!this.generalService.userId && this.generalService.providerId) {
            alert(3)
            this.authService.registerInit().then(res => {
              if (res.status == 1) {
                this.generalService.initData = res.data;
                this.router.navigate(['/wizard']);
              }
            })
          } else if (!this.generalService.userId && !this.generalService.providerId) {
            alert(4)
            // this.authService.registerInit().then(res => {
            //   if (res.status == 1) {
            //     this.generalService.initData = res.data;
            this.router.navigate(['login']);
            //   }
            // })
          }
        }
      })
    })
  }

  openDialog(message: any, title: any) {
    this.dialog.open(DialogContentComponent, {data: {message: message, title: title}});
  }

  async starter() {
    if (await this.authService.isAuthenticated()) {
      await this.generalService.getUserData();
    }
  }
}
