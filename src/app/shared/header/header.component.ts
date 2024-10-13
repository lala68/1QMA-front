import {Component, Inject, OnInit} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import {AuthService} from "../../services/auth/auth.service";
import {Preferences} from "@capacitor/preferences";
import {Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {ClientService} from "../../services/client/client.service";
import {GamesComponent} from "../../components/games/games.component";
import {GamesService} from "../../services/games/games.service";
import {ShopService} from "../../services/shop.service";
import {SnackbarContentComponent} from "../../components/snackbar-content/snackbar-content.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {IntroJsService} from "../../services/introJs/intro-js.service";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";

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
              private processHTTPMsgService: ProcessHTTPMsgService, private _snackBar: MatSnackBar) {

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
    const dialogRef = this.dialog.open(ExitGame, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
    });
  }

  async gotoHome() {
    this.generalService.startingGame = false;
    this.generalService.players = [];
    this.generalService.gameInit = '';
    this.generalService.gameStep = 1;
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
    const steps = [
      {
        element: '#create',
        intro: ('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et orci eu quam convallis tincidunt quis nec magna.'),
        position: 'bottom',
      }, {
        element: '#find',
        intro: ('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et orci eu quam convallis tincidunt quis nec magna.'),
        position: 'bottom',
      }, {
        element: '#addQuestion',
        intro: ('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et orci eu quam convallis tincidunt quis nec magna.'),
        position: 'bottom',
      }
    ];
    await this.intro.showHelp('dashboard', steps);
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
  wordCount: number = 100;
  wordCountAnswer: number = 100;
  selectedCategory: any = [];
  displayAnswer: boolean = false;

  constructor(public dialogRef: MatDialogRef<AddQuestion>, private _formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService,
              public generalService: GeneralService, private clientService: ClientService,
              public dialog: MatDialog, private _snackBar: MatSnackBar) {
  }

  updateWordCount() {
    this.wordCount = this.questionForm.controls.question.value ? (100 - this.questionForm.controls.question.value.trim().split(/\s+/).length) : 100;
  }

  updateWordCountAnswer() {
    this.wordCountAnswer = this.questionForm.controls.answer.value ? (100 - this.questionForm.controls.answer.value.trim().split(/\s+/).length) : 100;
  }

  isSelected(item: any): boolean {
    return this.selectedCategory.some((category: any) => category._id === item._id);
  }

  selectCat(item: any) {
    this.selectedCategory = [];
    this.selectedCategory.push(item);
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
    private generalService: GeneralService,
    private router: Router,
    private gameService: GamesService
  ) {
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  async exitGame(): Promise<void> {
    const data = await this.gameService.exitGame(this.generalService?.createdGameData?.game?.gameId);
    if (data.status === 1) {
      this.generalService.startingGame = false;
      this.generalService.players = [];
      this.generalService.gameInit = '';
      this.generalService.gameStep = 1;
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




