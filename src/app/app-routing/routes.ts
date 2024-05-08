import {Routes} from '@angular/router';
import {AccountInfoComponent} from "../components/account-info/account-info.component";
import {CreateCardComponent} from "../components/card/create-card/create-card.component";
import {CardListComponent} from "../components/card/card-list/card-list.component";
import {LoginComponent} from "../components/account-info/login/login.component";
import {AddWorkspaceComponent} from "../components/workspace/add-workspace/add-workspace.component";
import {authGuard} from "../auth.guard";
import {preferenceGuard} from "../preference.guard";
import {PreferenceComponent} from "../components/preference/preference.component";
import {ForgetPasswordComponent} from "../components/account-info/forget-password/forget-password.component";
import {SignupComponent} from "../components/account-info/signup/signup.component";
import {ResetPasswordComponent} from "../components/account-info/reset-password/reset-password.component";
import {WorkspaceCardsComponent} from "../components/workspace/workspace-cards/workspace-cards.component";
import {ViewComponent} from "../components/workspace/workspace-cards/view/view.component";
import {ChargeComponent} from "../components/wallet/charge/charge.component";
import {InvoicesComponent} from "../components/wallet/invoices/invoices.component";
import {OrdersComponent} from "../components/workspace/orders/orders.component";
import {PublicCardListComponent} from "../components/card/public-card-list/public-card-list.component";
import {InvoiceDetailComponent} from "../components/wallet/invoices/invoice-detail/invoice-detail.component";
import {HomeComponent} from "../components/home/home.component";
import {TempComponent} from "../components/temp/temp.component";
import {PlansComponent} from "../components/plans/plans.component";


export const routes: Routes = [
  {path: 'profile', component: AccountInfoComponent, canActivate: [authGuard]},//preferenceGuard
  {path: 'home', component: HomeComponent, canActivate: [authGuard]}, //preferenceGuard
  {path: 'create-card/:id', component: CreateCardComponent, canActivate: [authGuard]}, //preferenceGuard
  {path: 'card-list', component: CardListComponent, canActivate: [authGuard]}, //preferenceGuard
  {path: 'public-card-list', component: PublicCardListComponent, canActivate: [authGuard]}, //preferenceGuard
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'forget-password', component: ForgetPasswordComponent},
  {path: 'reset-password', component: ResetPasswordComponent},
  {path: 'add-workspace/:id', component: AddWorkspaceComponent, canActivate: [authGuard]}, //preferenceGuard
  {path: 'workspace-cards/:id', component: WorkspaceCardsComponent, canActivate: [authGuard]}, //preferenceGuard
  {path: 'card-view', component: ViewComponent, canActivate: [authGuard]}, //preferenceGuard
  {path: 'preference', component: PreferenceComponent, canActivate: [authGuard]},
  {path: 'plans', component: PlansComponent, canActivate: [authGuard]},
  {path: 'billing', component: ChargeComponent, canActivate: [authGuard]},
  {path: 'invoices', component: InvoicesComponent, canActivate: [authGuard]},
  {path: 'invoice-detail', component: InvoiceDetailComponent},
  {path: 'orders', component: OrdersComponent, canActivate: [authGuard]},
  {path: 'card', component: TempComponent, canActivate: [authGuard]},
  {path: '', redirectTo: '/home', pathMatch: 'full'},
];
