import {Component, Inject, OnInit} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import {AuthService} from "../../services/auth/auth.service";
import {Preferences} from "@capacitor/preferences";
import {Router, RouterModule} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ClientService} from "../../services/client/client.service";
import {GamesService} from "../../services/games/games.service";
import {ShopService} from "../../services/shop.service";
import {SnackbarContentComponent} from "../../components/snackbar-content/snackbar-content.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {IntroJsService} from "../../services/introJs/intro-js.service";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {ConfigService} from "../../services/config/config.service";
import {TutorialService} from "../../services/tutorial/tutorial.service";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared.module";
import {MatMenuModule} from "@angular/material/menu";
import {ShamsiDatePipe} from "../../pipes/shamsi-date.pipe";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  // standalone: true,
  // imports: [DaysAgoPipe]
})
export class HeaderComponent implements OnInit {
  notifList: any = [];

  constructor(public generalService: GeneralService, public authService: AuthService, private intro: IntroJsService,
              private router: Router, public dialog: MatDialog, private shopService: ShopService,
              private processHTTPMsgService: ProcessHTTPMsgService, private _snackBar: MatSnackBar,
              private translate: TranslateService) {

  }

  async ngOnInit(): Promise<any> {
    await this.generalService.getUserData();
    if (await this.generalService?.hasCompletedSignup) {
      this.shopService.getNotifications(1, 3).then(data => {
        this.generalService.notifList = data.data;
      })
    }
  }

  async logout() {
    this.authService.signout().then(async data => {
      if (data.status == 1) {
        await this.translate.use('en');
        await Preferences.clear();
        this.authService.isLoggedIn = false;
        this.generalService.userId = '';
        this.generalService.userObj = '';
        this.generalService.emailVerified = false;
        this.generalService.hasCompletedSignup = false;
        document.documentElement.dir = 'ltr';
        this.generalService.direction = document.documentElement.dir;
        await this.router.navigate(['/login']);
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
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


  async openAddQuestion() {
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

  async displayExitGameModal() {
    const dialogConfig = new MatDialogConfig();
    if (this.generalService.isMobileView) { // Assuming mobile devices are <= 768px
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.height = 'auto'; // You can specify the height if needed
      dialogConfig.position = {bottom: '0px'};
      dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
    } else {
      dialogConfig.width = '500px'; // Full size for desktop or larger screens
    }
    const dialogRef = this.dialog.open(ExitGame, dialogConfig);
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
    });
  }

  async gotoHome() {
    this.generalService.startingGame = false;
    this.generalService.startingGameTutorial = false;
    this.generalService.players = [];
    this.generalService.gameInit = '';
    this.generalService.gameStep = 1;
    this.generalService.gameTutorialStep = 1;
    this.generalService.createdGameData = '';
    this.generalService.gameQuestion = '';
    this.generalService.specificQuestionAnswers = '';
    this.generalService.gameAnswerGeneral = '';
    this.generalService.editingAnswer = true;
    this.generalService.isGameCancel = false;
    this.generalService.allQuestions = [];
    this.generalService.gameResult = '';
    this.generalService.rateAnswers = [];
    this.generalService.rateQuestions = [];
    this.generalService.invitedPlayersArray = [];
    await this.router.navigate(['/dashboard']);
  }

  async showIntro() {
    if (this.router.url === '/dashboard') {
      if (!this.generalService.isMobileView) {
        const steps = [
          {
            element: '#create',
            intro: this.translate.instant('header-create-game-intro'),
            position: 'bottom',
          }, {
            element: '#find',
            intro: this.translate.instant('header-find-game-intro'),
            position: 'bottom',
          }, {
            element: '#addQuestion',
            intro: this.translate.instant('header-add-question-intro'),
            position: 'bottom',
          }
        ];
        // Filter out steps where the element does not exist in the DOM
        const availableSteps = steps.filter(step =>
          document.querySelector(step.element) !== null
        );

        // Proceed with the intro only if there are valid steps
        if (availableSteps.length > 0) {
          await this.intro.showHelp('dashboard', availableSteps, 'header');
        }
      }
    }
  }

  async openAccountModal() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '100vw';
    dialogConfig.maxWidth = '100vw';
    dialogConfig.height = 'auto'; // You can specify the height if needed
    dialogConfig.position = {bottom: '0px'};
    dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile

    const dialogRef = this.dialog.open(AccountMobile, dialogConfig);
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
    });
  }

  async openGiftModal() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '100vw';
    dialogConfig.maxWidth = '100vw';
    dialogConfig.height = 'auto'; // You can specify the height if needed
    dialogConfig.position = {bottom: '0px'};
    dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile

    const dialogRef = this.dialog.open(GiftMobile, dialogConfig);
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
    });
  }

  async openNotifModal() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '100vw';
    dialogConfig.maxWidth = '100vw';
    dialogConfig.height = 'auto'; // You can specify the height if needed
    dialogConfig.position = {bottom: '0px'};
    dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile

    const dialogRef = this.dialog.open(NotificationMobile, dialogConfig);
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
    });
  }
}


@Component({
  selector: 'add-question',
  templateUrl: 'add-question.html',
  // standalone: true,
  // imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, SharedModule, TranslateModule],
})

export class AddQuestion {
  questionForm = this._formBuilder.group({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', []),
  });
  wordCount: number;
  wordCountAnswer: number;
  selectedCategory: any = [];
  displayAnswer: boolean = false;

  constructor(public dialogRef: MatDialogRef<AddQuestion>, private _formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService,
              public generalService: GeneralService, private clientService: ClientService,
              public dialog: MatDialog, private _snackBar: MatSnackBar, public configService: ConfigService) {
    this.wordCount = this.generalService.clientInit.answerWordsLimitation;
    this.wordCountAnswer = this.generalService.clientInit.answerWordsLimitation;
  }

  updateWordCount() {
    this.wordCount = this.questionForm.controls.question.value ? (this.generalService.clientInit.answerWordsLimitation - this.questionForm.controls.question.value.trim().split(/\s+/).length) : this.generalService.clientInit.answerWordsLimitation;
  }

  updateWordCountAnswer() {
    this.wordCountAnswer = this.questionForm.controls.answer.value ? (this.generalService.clientInit.answerWordsLimitation - this.questionForm.controls.answer.value.trim().split(/\s+/).length) : this.generalService.clientInit.answerWordsLimitation;
  }

  isSelected(item: any): boolean {
    return this.selectedCategory.some((category: any) => category._id === item._id);
  }

  selectCat(id: any) {
    this.selectedCategory = [];
    this.selectedCategory.push(id);
  }

  async submit() {
    this.clientService.addQuestion(this.questionForm.value, this.selectedCategory[0]).then(data => {
      if (data.status == 1) {
        this.openDialog(data.message, 'Success');
        this.dialogRef.close();
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
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

  async closeModal() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'exit-game',
  templateUrl: 'exit-game.html',
})
export class ExitGame {

  constructor(
    public dialogRef: MatDialogRef<ExitGame>,
    public generalService: GeneralService,
    private router: Router,
    private gameService: GamesService,
    private tutorialService: TutorialService
  ) {
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  async exitGame(): Promise<void> {
    if (this.generalService.startingGame) {
      const data = await this.gameService.exitGame(this.generalService?.startingGame ? this.generalService?.createdGameData?.game?.gameId : this.generalService?.createdGameData?._id);
      if (data.status === 1) {
        this.generalService.startingGame = false;
        this.generalService.startingGameTutorial = false;
        this.generalService.players = [];
        this.generalService.gameInit = '';
        this.generalService.gameStep = 1;
        this.generalService.gameTutorialStep = 1;
        this.generalService.createdGameData = '';
        this.generalService.gameQuestion = '';
        this.generalService.specificQuestionAnswers = '';
        this.generalService.gameAnswerGeneral = '';
        this.generalService.editingAnswer = true;
        this.generalService.isGameCancel = false;
        this.generalService.allQuestions = [];
        this.generalService.gameResult = '';
        this.generalService.rateAnswers = [];
        this.generalService.rateQuestions = [];
        this.generalService.invitedPlayersArray = [];
        this.dialogRef.close(true);
        await this.router.navigate(['/dashboard']);
      }
    } else if (this.generalService.startingGameTutorial) {
      const data = await this.tutorialService.exitTutorialGame(this.generalService?.startingGame ? this.generalService?.createdGameData?.game?.gameId : this.generalService?.createdGameData?._id);
      if (data.status === 1) {
        this.generalService.startingGame = false;
        this.generalService.startingGameTutorial = false;
        this.generalService.players = [];
        this.generalService.gameInit = '';
        this.generalService.gameStep = 1;
        this.generalService.gameTutorialStep = 1;
        this.generalService.createdGameData = '';
        this.generalService.gameQuestion = '';
        this.generalService.specificQuestionAnswers = '';
        this.generalService.gameAnswerGeneral = '';
        this.generalService.editingAnswer = true;
        this.generalService.isGameCancel = false;
        this.generalService.allQuestions = [];
        this.generalService.gameResult = '';
        this.generalService.rateAnswers = [];
        this.generalService.rateQuestions = [];
        this.generalService.invitedPlayersArray = [];
        this.dialogRef.close(true);
        await this.router.navigate(['/dashboard']);
      }
    }

  }
}


@Component({
  selector: 'account-mobile',
  templateUrl: 'account-mobile.html',
  // standalone: true,
  // imports: [TranslateModule, CommonModule, SharedModule, MatMenuModule, FormsModule, RouterModule, ReactiveFormsModule,]
})

export class AccountMobile {

  constructor(
    public dialogRef: MatDialogRef<ExitGame>,
    public generalService: GeneralService,
    private router: Router,
    private processHTTPMsgService: ProcessHTTPMsgService,
    private authService: AuthService,
    private gameService: GamesService,
    private _snackBar: MatSnackBar,
    public configService: ConfigService
  ) {
  }

  async closeModal() {
    this.dialogRef.close();
  }

  async logout() {
    this.authService.signout().then(async data => {
      if (data.status == 1) {
        await Preferences.clear();
        this.authService.isLoggedIn = false;
        this.generalService.userId = '';
        this.generalService.userObj = '';
        this.generalService.emailVerified = false;
        this.generalService.hasCompletedSignup = false;
        await this.router.navigate(['/login']);
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
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


}

@Component({
  selector: 'notification-mobile',
  templateUrl: 'notification-mobile.html',
  standalone: true,
  imports: [TranslateModule, CommonModule, SharedModule, MatMenuModule, FormsModule,
    RouterModule, ReactiveFormsModule, ShamsiDatePipe]
})

export class NotificationMobile {

  constructor(
    public dialogRef: MatDialogRef<ExitGame>,
    public generalService: GeneralService,
    private router: Router,
    private processHTTPMsgService: ProcessHTTPMsgService,
    public configService: ConfigService
  ) {
  }

  async closeModal() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'gift-mobile',
  templateUrl: 'gift-mobile.html',
  // standalone: true,
  // imports: [TranslateModule, CommonModule, SharedModule, MatMenuModule, FormsModule, RouterModule, ReactiveFormsModule,]
})

export class GiftMobile {

  constructor(
    public dialogRef: MatDialogRef<ExitGame>,
    public generalService: GeneralService,
    private router: Router,
    private processHTTPMsgService: ProcessHTTPMsgService,
    public configService: ConfigService
  ) {
  }

  async closeModal() {
    this.dialogRef.close();
  }
}








