import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from "@angular/core";
import {AuthService} from "./services/auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class authGuard {
  constructor(private authService: AuthService, private router: Router) {
  }

  // canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return true;
  // }
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    if (!await this.authService.isAuthenticated()) {
      await this.router.navigate(['/login']);
    }
    return await this.authService.isAuthenticated();
  }
}
