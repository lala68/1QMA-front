import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from "./services/auth/auth.service";
import {GeneralService} from "./services/general/general.service";

@Injectable({
  providedIn: 'root'
})
export class GameGuard implements CanActivate {

  constructor(private generalService: GeneralService, private router: Router) {
  }

  canActivate(): boolean {
    if (!this.generalService.startingGame) {
      // If the user is logged in, redirect to the dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
