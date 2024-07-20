import {Component, Inject} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import {AuthService} from "../../services/auth/auth.service";
import {Preferences} from "@capacitor/preferences";
import {Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {ClientService} from "../../services/client/client.service";
import {GamesComponent} from "../../components/games/games.component";
import {GamesService} from "../../services/games/games.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {

  constructor(public generalService: GeneralService, public authService: AuthService,
              private router: Router, public dialog: MatDialog) {
  }

  async logout() {
    this.authService.signout().then(async data => {
      if (data.status == 1) {
        await Preferences.clear();
        this.authService.isLoggedIn = false;
        this.generalService.userId = '';
        this.generalService.userObj = '';
        this.generalService.hasCompletedSignup = false;
        await this.router.navigate(['/login']);
      }
    })
  }

  async openAddQuestion() {
    const dialogRef = this.dialog.open(AddQuestion, {
      width: '700px'
    });
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
    answer: new FormControl('', [Validators.required]),
  });
  wordCount: number = 100;
  wordCountAnswer: number = 100;
  selectedCategory: any = [];
  error: any = '';
  displayAnswer: boolean = false;

  constructor(public dialogRef: MatDialogRef<AddQuestion>, private _formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService,
              public generalService: GeneralService, private clientService: ClientService,
              public dialog: MatDialog) {
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
    this.error = '';
    this.clientService.addQuestion(this.questionForm.value, this.selectedCategory).then(data => {
      if (data.status == 1) {
        this.dialogRef.close();
      } else {
        this.error = data?.message;
      }
    })
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

  constructor(public dialogRef: MatDialogRef<ExitGame>, private generalService: GeneralService,
              private router: Router, private gameService: GamesService) {
  }

  async cancel() {
    this.dialogRef.close();
  }

  async exitGame() {
    this.gameService.exitGame(this.generalService?.createdGameData?.game?.gameId).then(async data => {
      if (data.status == 1) {
        this.generalService.startingGame = false;
        this.generalService.players = [];
        this.generalService.gameInit = '';
        this.generalService.gameStep = 1;
        this.generalService.createdGameData = '';
        this.generalService.gameQuestion = '';
        this.generalService.specificQuestionAnswers = '';
        this.generalService.gameAnswerGeneral = '';
        this.generalService.editingAnswer = true;
        this.generalService.allQuestions = [];
        this.generalService.gameResult = '';
        this.generalService.rateAnswers = [];
        this.generalService.rateQuestions = [];
        this.generalService.invitedPlayersArray = [];
        this.dialogRef.close();
        // if (this.generalService.socket) {
        //   this.generalService.socket.disconnect();
        //   console.log('disconnected')
        //   this.generalService.socket.on("disconnected", function () {
        //     console.log('disconnected')
        //   });
        // }
        await this.router.navigate(['/dashboard']);
      }
    })
  }
}




