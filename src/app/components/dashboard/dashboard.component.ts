import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {ClientService} from "../../services/client/client.service";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {GeneralService} from "../../services/general/general.service";
import {NavigationStart, Router, RouterModule} from "@angular/router";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ConfigService} from "../../services/config/config.service";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {ParsIntPipe} from "../../pipes/pars-int.pipe";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {LoaderService} from "../../services/loader/loader.service";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import translate from "translate";
import {GamesService} from "../../services/games/games.service";
import {AddQuestion, ExitGame, HeaderComponent} from "../../shared/header/header.component";
import {CharityModalComponent} from "../charity-modal/charity-modal.component";
import {IntroJsService} from "../../services/introJs/intro-js.service";
import {SidenavComponent} from "../../shared/sidenav/sidenav.component";
import {JoiningGame} from "../games/games.component";
import introJs from "intro.js";
import {Preferences} from "@capacitor/preferences";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, NgxMatIntlTelInputComponent,
    TranslateModule, ClipboardModule, ParsIntPipe, DaysAgoPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [HeaderComponent]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('tooltip') tooltip!: any;
  loading$ = this.loader.isLoading$;
  loading: boolean = true;
  loadingInvite: boolean = false;
  loadingContent: boolean = true;
  loadingQuestionsFromFriendsLatestGames: boolean = true;
  invitedEmail: any;
  inviteForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
  });
  startDate: any; // in milliseconds
  expireDays: any;
  remainingDays: any;
  selectedTabTopQuestionsIndex: any = 0;
  topQuestions: any;
  selectedCategory: any = '';
  questionsFromFriendsLatestGames: any = [];
  loadingMore: boolean = false;
  page: any = 1;
  noMoreItems: any;
  private routerSubscription: any;
  private introInProgress: boolean = false; // Track whether the intro is showing
  tooltipVisible = false;  // Control whether the tooltip is visible
  tooltipMessage = 'Click to copy!';

  constructor(private clientService: ClientService, private _formBuilder: FormBuilder, private processHTTPMsgService: ProcessHTTPMsgService,
              public generalService: GeneralService, public configService: ConfigService, private loader: LoaderService,
              private router: Router, public dialog: MatDialog, private _snackBar: MatSnackBar, private sideNavComponent: SidenavComponent,
              private gameService: GamesService, private intro: IntroJsService,
              private headerComponent: HeaderComponent, private translate: TranslateService) {
    this.generalService.currentRout = '/dashboard';
    this.generalService.selectedTabIndexParentInTrivia = 0;
    this.generalService.selectedTabIndexQuestionChildInTrivia = 0;
    this.generalService.selectedTabIndexGameChildInTrivia = 0;
  }

  async ngOnInit() {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && this.introInProgress) {
        this.destroyIntro(); // Destroy the intro if the page is changing
      }
    });
    await this.generalService.getUserData();
    await this.getGameInit();
    this.calculateRemainingDays();
    this.changeTopQuestions();
    await this.getQuestionsFromFriendsLatestGames();
    this.loading = false;
    await this.waitForClientInit();

    // After clientInit is ready, check the value
    if (
      this.generalService.clientInit &&
      this.generalService.clientInit.user &&
      this.generalService.clientInit.user.hasSeenIntros &&
      (!this.generalService.clientInit.user.hasSeenIntros.dashboard)
    ) {
      await this.sideNavComponent.showIntro();
      await this.headerComponent.showIntro();
      await this.showIntro(); // Wait for showIntro to finish
    }
  }

  async waitForClientInit() {
    while (!this.generalService.clientInit?.user?.hasSeenIntros) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Check every 100ms
    }
  }

  ngOnDestroy() {
    introJs().exit(true);
  }

  destroyIntro() {
    // if (this.introInProgress) {
    introJs().exit(true); // Assuming 'cancel()' is a method from the intro library to stop the intro
    //   this.introInProgress = false; // Reset the flag
    // }
  }


  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/frame.png';
  }

  calculateRemainingDays(): void {
    // Convert startDate from milliseconds to a Date object
    const startDate = new Date(this.generalService.userObj.accountType.startDate);

    // Calculate the expiration date
    const expirationDate = new Date(startDate);
    expirationDate.setDate(expirationDate.getDate() + this.generalService.userObj.accountType.expireDays);

    // Get the current date
    const currentDate = new Date();

    // Calculate the difference between the expiration date and the current date
    const timeDiff = expirationDate.getTime() - currentDate.getTime();
    this.remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  async gotoUserDetail(id: any) {
    // await this.router.navigate(['user-detail'], {state: {id: id}});
    await this.router.navigate(['user-detail'], {queryParams: {id: id}});
  }

  async openAddQuestion() {
    // const dialogRef = this.dialog.open(AddQuestion, {
    //   width: '700px'
    // });
    // dialogRef.afterClosed().subscribe(async result => {
    //   if (result == 'success') {
    //   }
    // });
    const dialogConfig = new MatDialogConfig();

    // Check if it's mobile
    if (this.generalService.isMobileView) { // Assuming mobile devices are <= 768px
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.height = 'auto'; // You can specify the height if needed
      dialogConfig.position = {bottom: '0px'};
      dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
    } else {
      dialogConfig.width = '700px'; // Full size for desktop or larger screens
    }

    const dialogRef = this.dialog.open(AddQuestion, dialogConfig);
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
    });
  }

  onSubmit() {
    this.loadingInvite = true;
    this.clientService.inviteFriend(this.inviteForm.value, this.generalService.userId).then(async data => {
      this.loadingInvite = false;
      if (data.status == 1) {
        this.generalService.userObj = (data.data);
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        this.openDialog(data.message, 'Success');
      } else {
        this.openDialog(data.message, 'Error');
      }
    })
  }

  openDialog(message: any, title: any) {
    this._snackBar.openFromComponent(SnackbarContentComponent, {
      data: {
        title: title,
        message: message
      },
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: title == 'Success' ? 'app-notification-success' : 'app-notification-error'
    });
  }

  getGameInit() {
    this.clientService.clientInit().then(async data => {
      this.generalService.clientInit = data.data;
      this.generalService.userObj = (data.data.user);
      //
      await Preferences.remove({key: 'account'});
      await Preferences.set({key: 'account', value: JSON.stringify(data.data.user)});
      //
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
    this.gameService.gameInit().then(data => {
      if (data.status == 1) {
        this.generalService.gameInit = data.data;
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  changeTopQuestions() {
    this.loadingContent = true;
    this.clientService.getMyOrAllQuestions(this.selectedTabTopQuestionsIndex == 0 ? 'private' : 'public',
      this.selectedCategory ? this.selectedCategory : '', 5, 1).then(data => {
      this.loadingContent = false;
      this.topQuestions = data.data;
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  isSelected(item: any): boolean {
    return this.selectedCategory.some((category: any) => category._id === item._id);
  }

  async selectCatTopQuestion(id: any) {
    console.log(id)
    this.selectedCategory = id;
    // this.selectedCategory.push(id);
    await this.changeTopQuestions();
  }

  async gotoQuestionDetail(item: any) {
    // await this.router.navigate(['trivia-hub'], {state: {question: item}});
    await this.router.navigate(['question-detail'], {queryParams: {id: item._id}});
  }

  async getQuestionsFromFriendsLatestGames() {
    this.clientService.getQuestionsFromFriendsLatestGames(2, this.page).then(data => {
      this.questionsFromFriendsLatestGames = data.data;
      this.loadingQuestionsFromFriendsLatestGames = false;
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  async gotoResult(id: any) {
    // await this.router.navigate(['game-result'], {state: {id: id}});
    await this.router.navigate(['game-result'], {queryParams: {id: id}});
  }

  showMoreFriendsQuestions() {
    this.loadingMore = true;
    this.clientService.getQuestionsFromFriendsLatestGames(2, this.page + 1).then(data => {
      this.loadingMore = false;
      this.page++;
      if (data.status == 1) {
        this.questionsFromFriendsLatestGames = this.questionsFromFriendsLatestGames.concat(data.data);
        this.noMoreItems = data.data?.length < 2;
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  openCharityModal() {
    const dialogConfig = new MatDialogConfig();
    // Check if it's mobile
    if (this.generalService.isMobileView) { // Assuming mobile devices are <= 768px
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.height = 'auto'; // You can specify the height if needed
      dialogConfig.position = {bottom: '0px'};
      dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
    } else {
      dialogConfig.width = '700px'; // Full size for desktop or larger screens
    }
    const dialogRef = this.dialog.open(CharityModalComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
    });
  }

  showTooltip() {
    this.tooltip.show();
    // this.tooltipVisible = true;  // Set tooltip visibility to true
    this.tooltipMessage = 'Copied!';
    // Hide tooltip after 2 seconds
    setTimeout(() => {
      this.tooltip.hide();
      setTimeout(() => {
        this.tooltipMessage = 'Click to copy!';
      }, 500);
      // this.tooltipVisible = false;  // Reset tooltip visibility
    }, 1000);
  }

  async showIntro() {
    if (this.router.url === '/dashboard') {
      // Define steps with selectors for elements that might not always be present
      if (!this.generalService.isMobileView) {
        var steps = [
          {
            element: '#accountOverview',
            intro: this.translate.instant('account-overview-dashboard-section-intro'),
            position: 'bottom',
          },
          {
            element: '#topQuestions',
            intro: this.translate.instant('top-question-dashboard-section-intro'),
            position: 'bottom',
          },
          {
            element: '#InviteFriends',
            intro: this.translate.instant('invite-friends-dashboard-section-intro'),
            position: 'bottom',
          },
          {
            element: '#charity',
            intro: this.translate.instant('charity-dashboard-section-intro'),
            position: 'bottom',
          },
          {
            element: '#questionsFromFriends',
            intro: this.translate.instant('questions-from-friends-dashboard-section-intro'),
            position: 'bottom',
          }
        ];
      } else {
        var steps = [
          {
            element: '#create_mobile',
            intro: this.translate.instant('header-create-game-intro'),
            position: 'bottom',
          }, {
            element: '#find_mobile',
            intro: this.translate.instant('header-find-game-intro'),
            position: 'bottom',
          }, {
            element: '#addQuestion_mobile',
            intro: this.translate.instant('header-add-question-intro'),
            position: 'bottom',
          },
          {
            element: '#accountOverview',
            intro: this.translate.instant('account-overview-dashboard-section-intro'),
            position: 'bottom',
          },
          {
            element: '#topQuestions',
            intro: this.translate.instant('top-question-dashboard-section-intro'),
            position: 'bottom',
          },
          {
            element: '#InviteFriends',
            intro: this.translate.instant('invite-friends-dashboard-section-intro'),
            position: 'bottom',
          },
          {
            element: '#charity',
            intro: this.translate.instant('charity-dashboard-section-intro'),
            position: 'bottom',
          },
          {
            element: '#questionsFromFriends',
            intro: this.translate.instant('questions-from-friends-dashboard-section-intro'),
            position: 'bottom',
          }
        ];
      }

      // Filter out steps where the element does not exist in the DOM
      const availableSteps = steps.filter(step =>
        document.querySelector(step.element) !== null
      );

      // Proceed with the intro only if there are valid steps
      if (availableSteps.length > 0) {
        await this.intro.showHelp('dashboard', availableSteps, 'dashboard');
      }
    }

  }
}
