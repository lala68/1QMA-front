import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {register} from 'swiper/element/bundle';
import {TranslateService} from "@ngx-translate/core";
import {GeneralService} from "./services/general/general.service";
import {AuthService} from "./services/auth/auth.service";

register();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '1QMA';

  constructor(private router: Router, private translateService: TranslateService,
              private generalService: GeneralService, private authService: AuthService) {
    this.translateService.setDefaultLang('en');
    this.starter().then((data) => {
      if (this.generalService.userId && !this.generalService.hasCompletedSignup) {
        this.authService.registerInit().then(res => {
          console.log(res)
          if (res.status == 1) {
            this.generalService.initData = res.data;
            this.router.navigate(['/wizard']);
          }
        })
      } else if (this.generalService.userId && this.generalService.hasCompletedSignup) {
        this.authService.registerInit().then(res => {
          if (res.status == 1) {
            this.generalService.initData = res.data;
            this.router.navigate(['/dashboard']);
          }
        })
      } else {
        this.authService.registerInit().then(res => {
          console.log(res)
          if (res.status == 1) {
            this.generalService.initData = res.data;
            this.router.navigate(['login']);
          }
        })
        // this.router.navigate(['wizard']);
      }
    })
  }

  async starter() {
    if (await this.authService.isAuthenticated()) {
      await this.generalService.getUserData();
    }
  }
}
