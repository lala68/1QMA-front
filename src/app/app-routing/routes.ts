import {Routes} from '@angular/router';
import {LoginComponent} from "../components/login/login.component";
import {ForgetPasswordComponent} from "../components/forget-password/forget-password.component";
import {SignupComponent} from "../components/signup/signup.component";
import {WizardComponent} from "../components/wizard/wizard.component";
import {authGuard} from "../auth.guard";

export const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'forget-password', component: ForgetPasswordComponent},
  {path: 'wizard', component: WizardComponent, canActivate: [authGuard]},
  {path: '', redirectTo: '', pathMatch: 'full'},
];
