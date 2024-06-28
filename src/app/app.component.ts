import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {register} from 'swiper/element/bundle';
import {TranslateService} from "@ngx-translate/core";
import {GeneralService} from "./services/general/general.service";
import {AuthService} from "./services/auth/auth.service";
import {ClientService} from "./services/client/client.service";
import {Preferences} from "@capacitor/preferences";
import {Location} from "@angular/common";

register();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = '1QMA';

  constructor(private router: Router, private translateService: TranslateService,
              private generalService: GeneralService, private authService: AuthService,
              private clientService: ClientService, private route: ActivatedRoute,  private location: Location) {
    this.translateService.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.starter().then(async (data) => {
      this.route.queryParams.subscribe(async params => {
        console.log(params)
        await this.generalService.getUserData();
        const provider_id = params['provider_id'];
        const email = params['email'];
        if (provider_id) {
          await Preferences.set({key: 'provider', value: JSON.stringify({provider_id: provider_id, email: email})});
          this.authService.registerInit().then(async res => {
            if (res.status == 1) {
              this.generalService.initData = res.data;
              await this.authService.isAuthenticated();
              await this.generalService.getUserData();
              await this.router.navigate(['wizard'], {state: {email: email}});
            }
          })
        } else {
          if (this.generalService.userId && !this.generalService.hasCompletedSignup) {
            this.authService.registerInit().then(res => {
              if (res.status == 1) {
                this.generalService.initData = res.data;
                this.router.navigate(['/wizard']);
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
            // this.router.navigate(['/dashboard']);
          } else {
            this.authService.registerInit().then(res => {
              if (res.status == 1) {
                this.generalService.initData = res.data;
                this.router.navigate(['login']);
              }
            })
            // this.router.navigate(['wizard']);
          }
        }
      })
    })
  }

  async starter() {
    if (await this.authService.isAuthenticated()) {
      await this.generalService.getUserData();
    }
  }
}
