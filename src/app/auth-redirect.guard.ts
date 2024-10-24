import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from "./services/auth/auth.service";
import {GeneralService} from "./services/general/general.service";

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private generalService: GeneralService) {
  }

  async canActivate(): Promise<boolean> {
    // if (this.authService.isLoggedIn) {
    await this.generalService.getUserData();
    if (this.generalService.userId) {
      // If the user is logged in, redirect to the dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
