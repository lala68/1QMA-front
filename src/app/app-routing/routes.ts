import {Routes} from '@angular/router';
import {LoginComponent} from "../components/login/login.component";
import {ForgetPasswordComponent} from "../components/forget-password/forget-password.component";
import {SignupComponent} from "../components/signup/signup.component";
import {WizardComponent} from "../components/wizard/wizard.component";

export const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'forget-password', component: ForgetPasswordComponent},
  {path: 'wizard', component: WizardComponent},
  {path: '', redirectTo: '', pathMatch: 'full'},
];
