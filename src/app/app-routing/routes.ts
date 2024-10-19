import {Routes} from '@angular/router';
import {LoginComponent} from "../components/login/login.component";
import {ForgetPasswordComponent} from "../components/forget-password/forget-password.component";
import {SignupComponent} from "../components/signup/signup.component";
import {WizardComponent} from "../components/wizard/wizard.component";
import {authGuard} from "../auth.guard";
import {SignupSocialComponent} from "../components/signup-social/signup-social.component";
import {SignupReferEmailComponent} from "../components/signup-refer-email/signup-refer-email.component";
import {DashboardComponent} from "../components/dashboard/dashboard.component";
import {SettingsComponent} from "../components/settings/settings.component";
import {AccountInfoComponent} from "../components/account-info/account-info.component";
import {SocialCallbackComponent} from "../components/social-callback/social-callback.component";
import {UserDetailComponent} from "../components/user-detail/user-detail.component";
import {AuthRedirectGuard} from "../auth-redirect.guard";
import {GamesComponent} from "../components/games/games.component";
import {GameBoardComponent} from "../components/game-board/game-board.component";
import {GameGuard} from "../game.guard";
import {GameResultComponent} from "../components/game-result/game-result.component";
import {TriviaHubComponent} from "../components/trivia-hub/trivia-hub.component";
import {ShopComponent} from "../components/shop/shop.component";
import {NotificationComponent} from "../components/notification/notification.component";
import {TransactionsComponent} from "../components/transactions/transactions.component";
import {FaqComponent} from "../components/faq/faq.component";
import {TermsComponent} from "../components/terms/terms.component";
import {GiftHistoryComponent} from "../components/gift-history/gift-history.component";
import {ReportBugComponent} from "../components/report-bug/report-bug.component";
import {PrivacyComponent} from "../components/privacy/privacy.component";
import {TutorialComponent} from "../components/tutorial/tutorial.component";
import {QuestionDetailComponent} from "../components/question-detail/question-detail.component";

export const routes: Routes = [
  {path: 'login', component: LoginComponent, canActivate: [AuthRedirectGuard]},
  {path: 'signup', component: SignupComponent, canActivate: [AuthRedirectGuard]},
  {path: 'forget-password', component: ForgetPasswordComponent, canActivate: [AuthRedirectGuard]},
  {path: 'wizard', component: WizardComponent, canActivate: [authGuard]},
  {path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
  {path: 'transactions', component: TransactionsComponent, canActivate: [authGuard]},
  {path: 'notification', component: NotificationComponent, canActivate: [authGuard]},
  {path: 'gift-history', component: GiftHistoryComponent, canActivate: [authGuard]},
  {path: 'games/:id', component: GamesComponent, canActivate: [authGuard]},
  {path: 'trivia-hub', component: TriviaHubComponent, canActivate: [authGuard]},
  {path: 'shop', component: ShopComponent, canActivate: [authGuard]},
  {path: 'tutorial', component: TutorialComponent, canActivate: [authGuard]},
  {path: 'report-bug', component: ReportBugComponent, canActivate: [authGuard]},
  {path: 'faq', component: FaqComponent},
  {path: 'terms', component: TermsComponent},
  {path: 'privacy', component: PrivacyComponent},
  {path: 'game-result', component: GameResultComponent, canActivate: [authGuard]},
  {path: 'game-board', component: GameBoardComponent, canActivate: [authGuard, GameGuard]},
  {path: 'game/join', component: GamesComponent, canActivate: [authGuard]},
  {path: 'signup-social', component: SignupSocialComponent, canActivate: [AuthRedirectGuard]},
  // {path: 'signup-refer-email', component: SignupReferEmailComponent, canActivate: [AuthRedirectGuard]},
  {path: 'signup-refer-email', component: SignupReferEmailComponent, canActivate: []},
  {path: 'settings', component: SettingsComponent, canActivate: [authGuard]},
  {path: 'account-info', component: AccountInfoComponent, canActivate: [authGuard]},
  {path: 'user-detail', component: UserDetailComponent, canActivate: [authGuard]},
  {path: 'question-detail', component: QuestionDetailComponent, canActivate: [authGuard]},
  {path: 'social/callback', component: SocialCallbackComponent},
  {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
];
