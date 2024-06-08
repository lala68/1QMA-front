import {Routes} from '@angular/router';
import {LoginComponent} from "../components/login/login.component";
import {ForgetPasswordComponent} from "../components/forget-password/forget-password.component";
import {SignupComponent} from "../components/signup/signup.component";
import {WizardComponent} from "../components/wizard/wizard.component";
import {authGuard} from "../auth.guard";
import {SignupSocialComponent} from "../components/signup-social/signup-social.component";
import {SignupReferEmailComponent} from "../components/signup-refer-email/signup-refer-email.component";
import {DashboardComponent} from "../components/dashboard/dashboard.component";

export const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'forget-password', component: ForgetPasswordComponent},
  {path: 'wizard', component: WizardComponent, canActivate: [authGuard]},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'signup-social', component: SignupSocialComponent},
  {path: 'signup-refer-email', component: SignupReferEmailComponent},
  // {path: 'wizard', component: WizardComponent},
  {path: '', redirectTo: '', pathMatch: 'full'},
];
