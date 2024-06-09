import {Component} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import {AuthService} from "../../services/auth/auth.service";
import {Preferences} from "@capacitor/preferences";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(public generalService: GeneralService, public authService: AuthService,
              private router: Router) {
  }

  async logout() {
    this.authService.signout().then(async data => {
      if (data.status == 1) {
        await Preferences.clear();
        this.authService.isLoggedIn = false;
        this.generalService.userId = '';
        this.generalService.userObj = '';
        this.generalService.hasCompletedSignup = false;
        await this.router.navigate(['/login']);
      }
    })
  }
}
