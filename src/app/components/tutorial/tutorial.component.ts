import {Component, Inject, NgZone, ViewChild} from '@angular/core';
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {Router, RouterModule} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {ParsIntPipe} from "../../pipes/pars-int.pipe";
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatExpansionModule} from "@angular/material/expansion";
import {TimeDifferencePipe} from "../../pipes/time-difference.pipe";
import {GeneralService} from "../../services/general/general.service";
import {ConfigService} from "../../services/config/config.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {TutorialService} from "../../services/tutorial/tutorial.service";
import {ImportFromLibrary, JoiningGame} from "../games/games.component";
import {MaterialModule} from "../../shared/material/material.module";
import {GamesService} from "../../services/games/games.service";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {GameBoardComponent} from "../game-board/game-board.component";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, TranslateModule,
    ClipboardModule, CountdownTimerComponent, CdkDropList, CdkDrag, MatExpansionModule, TimeDifferencePipe,
    ParsIntPipe],
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.scss',
  providers: [GameBoardComponent, CountdownTimerComponent],
})
export class TutorialComponent {
  @ViewChild('answerTextArea') answerTextArea: any;
  @ViewChild(CountdownTimerComponent) countdownTimer: any;
  loading: boolean = false;
  data: any;
  sendAnswerDisable: boolean = false;
  sendRateAnswerDisable: boolean = false;
  sendRateQuestionsDisable: boolean = false;
  finishedTimerAnswer: boolean = false;
  finishedTimerRatingAnswer: boolean = false;
  finishedTimerRatingQuestions: boolean = false;
  nextStepTriggeredAnswer: boolean = false;
  nextStepTriggeredRatingAnswer: boolean = false;
  nextStepTriggeredRatingQuestions: boolean = false;
  submittedAnswer: any = {};
  panelOpenState: boolean[] = [];
  isModalOpen = false;
  congratulation: boolean = false;
  isDropped: boolean = false;
  isDroppedQuestion: boolean = false;
  myRank: any;
  tutorialInit: any;

  constructor(public generalService: GeneralService, private router: Router, private tutorialService: TutorialService,
              public configService: ConfigService, private ngZone: NgZone, private _snackBar: MatSnackBar,
              private countdownTimerComponent: CountdownTimerComponent, public dialog: MatDialog,
              private gameBoardComponent: GameBoardComponent, private processHTTPMsgService: ProcessHTTPMsgService) {
    //numberOfSubmitted maybe remove it
    this.submittedAnswer.numberOfSubmitted = 1;
    this.generalService.currentRout = '';
  }

  async ngOnInit() {
    this.tutorialService.gameTutorialInit().then(data => {
      if (data.status == 1) {
        this.tutorialInit = data.data;
      }
    });
  }

  async startTutorial() {
    const dialogConfig = new MatDialogConfig();
    // Check if it's mobile
    if (this.generalService.isMobileView) { // Assuming mobile devices are <= 768px
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.height = 'auto'; // You can specify the height if needed
      dialogConfig.position = {bottom: '0px'};
      dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
      dialogConfig.data = {data: this.tutorialInit.category, gameCode: ''}
    } else {
      dialogConfig.data = {data: this.tutorialInit.category, gameCode: ''}
      dialogConfig.width = '700px'; // Full size for desktop or larger screens
    }
    const dialogRef = this.dialog.open(JoiningTutorialGame, dialogConfig);
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
        this.generalService.gameTutorialStep = 1;
      }
    });
  }

  async handleGameStep(): Promise<void> {
    this.generalService.specificQuestionAnswers = '';
    if (this.generalService.gameTutorialStep == 2) {
      this.finishedTimerRatingQuestions = false;
      this.finishedTimerRatingAnswer = false;
      await this.waitForConditionsAnswer(); // Wait for conditions to be met
    } else if (this.generalService.gameTutorialStep == 3) {
      this.finishedTimerAnswer = false;
      this.finishedTimerRatingQuestions = false;
      await this.waitForConditionsRatingAnswer(); // Wait for conditions to be met
    } else if (this.generalService.gameTutorialStep == 4) {
      this.finishedTimerAnswer = false;
      this.finishedTimerRatingAnswer = false;
      await this.waitForConditionsRatingQuestions(); // Wait for conditions to be met
    }

    // Ensure visibility check or NgZone handling here if necessary
    await this.ngZone.run(async () => {
      switch (this.generalService.gameTutorialStep) {
        case 2:
          await this.stepTwoLogic();
          break;
        case 3:
          await this.stepThreeLogic();
          break;
        case 4:
          await this.stepFourLogic();
          break;
        default:
          console.warn(`Unknown game step: ${this.generalService.gameTutorialStep}`);
      }
      if (this.submittedAnswer)
        // this.submittedAnswer.numberOfSubmitted = 0;
        this.submittedAnswer.numberOfSubmitted = 1;
    });
  }

  private async stepTwoLogic(): Promise<void> {
    await this.ngZone.run(async () => {
      // console.log(this.finishedTimerAnswer)
      //new method  comment waitForConditionNextStepAnswer
      await this.waitForConditionNextStepAnswer();
      // console.log('waitForConditionNextStepAnswer');
      this.generalService.gameTutorialStep = 3;
      this.finishedTimerAnswer = false;
      const data = await this.tutorialService.getAllTutorialAnswersOfSpecificQuestion(
        this.generalService.createdGameData._id,
        this.generalService.gameQuestion._id
      );
      if (data.status === 1) {
        this.generalService.specificQuestionAnswers = data.data;
        this.updateRates(this.generalService.rateAnswers.length !== 0);
      }
    });
  }

  private async stepThreeLogic(): Promise<void> {
    await this.ngZone.run(async () => {
      const resQue = await this.tutorialService.getTutorialGameQuestionBasedOnStep(
        this.generalService.createdGameData._id,
        parseInt(this.generalService.gameQuestion.step) + 1
      );

      if (resQue.status === 1) {
        this.generalService.gameQuestion = resQue.data;
        this.generalService.gameAnswerGeneral = resQue.data.myAnswer || '';
        this.generalService.editingAnswer = !!resQue.data.myAnswer;
        // if(resQue.data.myAnswer){
        this.updateWordCountAnswer();
        // }
        // console.log(this.finishedTimerRatingAnswer)
        await this.waitForConditionNextStepRatingAnswer();
        this.generalService.gameTutorialStep = 2;
        this.finishedTimerRatingAnswer = false;
      } else if (resQue.status === -2) {
        const resQue = await this.tutorialService.getTutorialQuestionsOfGame(
          this.generalService.createdGameData._id
        );
        console.log(this.finishedTimerRatingQuestions)
        await this.waitForConditionNextStepRatingAnswer();
        this.generalService.gameTutorialStep = 4;
        this.generalService.allQuestions = resQue.data;
        this.updateRatesQuestions(this.generalService.rateQuestions.length !== 0);
      }
    });
  }

  private async stepFourLogic(): Promise<void> {
    console.log(this.finishedTimerRatingQuestions)
    console.log(this.nextStepTriggeredRatingQuestions)
    await this.ngZone.run(async () => {
      await this.waitForConditionNextStepQuestions()
    });
  }

  private async waitForConditionsAnswer(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.finishedTimerAnswer) {
          this.nextStepTriggeredAnswer = true;
          clearInterval(interval);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  private async waitForConditionsRatingAnswer(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.finishedTimerRatingAnswer) {
          this.nextStepTriggeredRatingAnswer = true;
          clearInterval(interval);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  private async waitForConditionsRatingQuestions(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.finishedTimerRatingQuestions) {
          this.nextStepTriggeredRatingQuestions = true;
          clearInterval(interval);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  private waitForConditionNextStepAnswer(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.nextStepTriggeredAnswer) {
          clearInterval(interval);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  private waitForConditionNextStepRatingAnswer(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.nextStepTriggeredRatingAnswer) {
          clearInterval(interval);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  private waitForConditionNextStepQuestions(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.nextStepTriggeredRatingQuestions) {
          clearInterval(interval);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  async getGameResult() {
    this.tutorialService.getTutorialGameResult(this.generalService.createdGameData._id).then(async data => {
        this.generalService.gameResult = data.data;
        this.generalService.gameResult.result.scoreboard.filter((item: any, index: any) => {
          if (item._id == this.generalService.userId) {
            this.myRank = index + 1;
          }
        });
      }
    )
  }

  async handleCountdownSendAnswerFinished() {
    const now = new Date();
    const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
    console.log("finishedTimer" + ' ' + `[${timeString}]  `);
    console.log("this.generalService.disconnectedModal" + this.generalService.disconnectedModal);
    this.finishedTimerAnswer = true;
    if (this.generalService.disconnectedModal == '') {
      if (!this.sendAnswerDisable) {
        // this.countdownTimer.resetTimer(3);
        await this.sendAnswer();
        this.sendAnswerDisable = true;
      } else {
        console.log("elseeeeee");
      }
    } else {
      this.generalService.gameAnswerGeneral = '';
      this.generalService.gameTutorialStep = 3;
      this.countdownTimer.resetTimer(3);
      this.nextStepTriggeredAnswer = false;
      this.nextStepTriggeredRatingAnswer = false;
      this.nextStepTriggeredRatingQuestions = false;
      this.finishedTimerAnswer = false;
      this.finishedTimerRatingAnswer = false;
      this.finishedTimerRatingQuestions = false;
      this.sendAnswerDisable = false;
      const data = await this.tutorialService.getAllTutorialAnswersOfSpecificQuestion(
        this.generalService.createdGameData._id,
        this.generalService.gameQuestion._id
      );

      if (data.status === 1) {
        this.generalService.specificQuestionAnswers = data.data;
        this.updateRates(this.generalService.rateAnswers.length !== 0);
      }
    }
  }

  async handleCountdownRatingAnswerFinished() {
    const now = new Date();
    const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
    console.log("finishedTimer" + ' ' + `[${timeString}]  `);
    this.finishedTimerRatingAnswer = true;
    if (this.generalService.disconnectedModal == '') {
      if (!this.sendRateAnswerDisable) {
        // this.countdownTimer.resetTimer(2);
        await this.sendRateAnswer(false);
        this.sendRateAnswerDisable = true;
      } else {
        console.log("elseeeeee");
      }
    } else {
      if (this.generalService.gameQuestion?.step == this.generalService.gameInit?.numberOfPlayers) {
        this.generalService.gameTutorialStep = 4;
        this.countdownTimer.resetTimer(4);
        const resQue = await this.tutorialService.getTutorialQuestionsOfGame(
          this.generalService.createdGameData._id
        );
        this.generalService.allQuestions = resQue.data;
        this.updateRatesQuestions(this.generalService.rateQuestions.length !== 0);
      } else {
        this.generalService.gameTutorialStep = 2;
        this.countdownTimer.resetTimer(2);
        this.nextStepTriggeredAnswer = false;
        this.nextStepTriggeredRatingAnswer = false;
        this.nextStepTriggeredRatingQuestions = false;
        this.finishedTimerAnswer = false;
        this.finishedTimerRatingAnswer = false;
        this.finishedTimerRatingQuestions = false;
        this.sendRateAnswerDisable = false;
        const resQue = await this.tutorialService.getTutorialGameQuestionBasedOnStep(
          this.generalService.createdGameData._id,
          parseInt(this.generalService.gameQuestion.step) + 1
        );
        if (resQue.status === 1) {
          this.generalService.gameQuestion = resQue.data;
          this.generalService.gameAnswerGeneral = resQue.data.myAnswer || '';
          this.generalService.editingAnswer = !!resQue.data.myAnswer;
          this.updateWordCountAnswer();
        }
      }
    }
  }

  async handleCountdownRatingQuestionsFinished() {
    const now = new Date();
    const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
    console.log("finishedTimer" + ' ' + `[${timeString}]  `);
    this.finishedTimerRatingQuestions = true;
    if (!this.sendRateQuestionsDisable) {
      await this.sendRateQuestions();
      this.sendRateQuestionsDisable = true;
    } else {
      this.generalService.gameTutorialStep = 5;
      await this.getGameResult();
    }
  }

  async sendAnswer(): Promise<any> {
    await this.ngZone.run(async () => {
      this.sendAnswerDisable = true;
      this.sendRateAnswerDisable = false;
      this.tutorialService.sendTutorialAnswer(this.generalService.createdGameData._id, this.generalService.gameQuestion._id, this.generalService.gameAnswerGeneral).then(data => {
        if (data.status == 1) {
          this.loading = false;
          this.finishedTimerAnswer = true;
          this.nextStepTriggeredAnswer = true;
          this.handleGameStep();
          this.countdownTimer.resetTimerTutorial(this.tutorialInit.eachStepDurationSeconds);
        } else {
          this.loading = false;
        }
      })
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    // Update the order of answers array
    moveItemInArray(this.generalService.specificQuestionAnswers.answers, event.previousIndex, event.currentIndex);
    // moveItemInArray(this.questions, event.previousIndex, event.currentIndex);

    // Update the rates array based on the new order of answers
    this.updateRates(true);
  }

  moveUpAnswers(index: number) {
    if (index > 0) {
      const temp = this.generalService.specificQuestionAnswers.answers[index];
      this.generalService.specificQuestionAnswers.answers[index] = this.generalService.specificQuestionAnswers.answers[index - 1];
      this.generalService.specificQuestionAnswers.answers[index - 1] = temp;
    }
  }

  moveDownAnswers(index: number) {
    if (index < this.generalService.specificQuestionAnswers.answers.length - 1) {
      const temp = this.generalService.specificQuestionAnswers.answers[index];
      this.generalService.specificQuestionAnswers.answers[index] = this.generalService.specificQuestionAnswers.answers[index + 1];
      this.generalService.specificQuestionAnswers.answers[index + 1] = temp;
    }
  }

  moveUpQuestions(index: number) {
    if (index > 0) {
      const temp = this.generalService.allQuestions[index];
      this.generalService.allQuestions[index] = this.generalService.allQuestions[index - 1];
      this.generalService.allQuestions[index - 1] = temp;
    }
  }

  moveDownQuestions(index: number) {
    if (index < this.generalService.allQuestions.length - 1) {
      const temp = this.generalService.allQuestions[index];
      this.generalService.allQuestions[index] = this.generalService.allQuestions[index + 1];
      this.generalService.allQuestions[index + 1] = temp;
    }
  }

  dropQuestions(event: CdkDragDrop<any[]>) {
    // Update the order of answers array
    moveItemInArray(this.generalService.allQuestions, event.previousIndex, event.currentIndex);

    // Update the rates array based on the new order of answers
    this.updateRatesQuestions(true);
  }

  updateRates(dropped: boolean = false) {
    if (!dropped) {
      this.generalService.rateAnswers = this.generalService.specificQuestionAnswers.answers.map((answer: any, index: any) => ({
        answer_id: answer._id,
        rate: '1.01' // Assuming the rate is the new index + 1 as a string
      }));
    } else {
      this.isDropped = true;
      this.generalService.rateAnswers = this.generalService.specificQuestionAnswers.answers.map((answer: any, index: any) => ({
        answer_id: answer._id,
        rate: (this.generalService.specificQuestionAnswers.answers.length - index).toString() // Assuming the rate is the new index + 1 as a string
      }));
    }
  }

  updateRatesQuestions(dropped: boolean = false) {
    if (!dropped) {
      this.generalService.rateQuestions = this.generalService.allQuestions.map((question: any, index: any) => ({
        question_id: question._id,
        rate: '1.01' // Assuming the rate is the new index + 1 as a string
      }));
    } else {
      this.isDroppedQuestion = true;
      this.generalService.rateQuestions = this.generalService.allQuestions.map((question: any, index: any) => ({
        question_id: question._id,
        rate: (this.generalService.allQuestions.length - index).toString() // Assuming the rate is the new index + 1 as a string
      }));
    }
  }

  async sendRateAnswer(dropped: any = false): Promise<any> {
    await this.ngZone.run(async () => {
      this.sendRateAnswerDisable = true;
      this.sendAnswerDisable = false;
      if (!dropped && this.isDropped) {
        await this.updateRates(true);
      } else if (dropped) {
        await this.updateRates(true);
      }
      this.tutorialService.sendTutorialRates(this.generalService.createdGameData._id, this.generalService.gameQuestion._id, this.generalService.rateAnswers).then(data => {
        if (data.status == 1) {
          this.loading = false;
          this.finishedTimerRatingAnswer = true;
          this.nextStepTriggeredRatingAnswer = true;
          this.handleGameStep();
          this.countdownTimer.resetTimerTutorial(this.tutorialInit.eachStepDurationSeconds);
        } else {
          this.loading = false;
        }
      })
    });
  }

  async sendRateQuestions(dropped: any = false): Promise<any> {
    this.sendRateQuestionsDisable = true;
    this.sendRateAnswerDisable = false;
    if (!dropped && this.isDroppedQuestion) {
      await this.updateRatesQuestions(true);
    } else if (dropped) {
      await this.updateRatesQuestions(true);
    }
    this.tutorialService.sendTutorialRateQuestions(this.generalService.createdGameData._id, this.generalService.rateQuestions).then(data => {
      if (data.status == 1) {
        this.loading = false;
        this.finishedTimerRatingQuestions = true;
        this.nextStepTriggeredRatingQuestions = true;
        this.handleCountdownRatingQuestionsFinished();
        this.handleGameStep();
      } else {
        this.loading = false;
      }
    })
  }

  async newGame() {
    this.generalService.startingGame = false;
    this.generalService.startingGameTutorial = false;
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
    this.submittedAnswer = null;
    await this.router.navigate(['/games/create-game']);
  }

  updateWordCountAnswer() {
    this.tutorialInit.wordCountAnswer = this.generalService?.gameAnswerGeneral ? ((this.tutorialInit?.answerWordsLimitation) - this.generalService?.gameAnswerGeneral.trim().split(/\s+/).length) : this.tutorialInit?.answerWordsLimitation;
  }

  startTutorialGame() {
    this.tutorialService.gameTutorialStart(this.generalService.createdGameData?.Category?._id, this.generalService.createdGameData?._id).then(data => {
      if (data.status == 1) {
        this.generalService.gameTutorialStep = 2;
        setTimeout(() => {
          this.tutorialService.getTutorialGameQuestionBasedOnStep(this.generalService.createdGameData?._id, 1).then(async resQue => {
            this.generalService.gameQuestion = resQue?.data;
            console.log(this.generalService.gameQuestion)
            this.updateWordCountAnswer();
            if (resQue?.data?.myAnswer) {
              this.generalService.gameAnswerGeneral = resQue?.data?.myAnswer;
            }
          }, error => {
            return this.processHTTPMsgService.handleError(error);
          });
        }, 500)
        this.handleGameStep()
      }
    })
  }
}

@Component({
  selector: 'joining-tutorial-game',
  templateUrl: 'joining-tutorial-game.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, SharedModule, TranslateModule],
})

export class JoiningTutorialGame {
  questionForm = this._formBuilder.group({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', [Validators.required]),
  });
  wordCount: number = 100;
  wordCountAnswer: number = 100;
  loading: boolean = false;
  questionId: any;

  constructor(private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<JoiningGame>, public configService: ConfigService,
              public dialog: MatDialog, private gameService: GamesService, public generalService: GeneralService,
              @Inject(MAT_DIALOG_DATA) public data: any, private router: Router, private _snackBar: MatSnackBar,
              private tutorialService: TutorialService) {
  }

  async closeModal() {
    this.dialogRef.close();
  }

  openImportFromLib() {
    const dialogConfig = new MatDialogConfig();
    // Check if it's mobile
    if (this.generalService.isMobileView) { // Assuming mobile devices are <= 768px
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.height = 'auto'; // You can specify the height if needed
      dialogConfig.position = {bottom: '0px'};
      dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
      dialogConfig.data = {category: this.data?.data?._id, type: 'Normal'};
    } else {
      dialogConfig.data = {category: this.data?.data?._id, type: 'Normal'};
      dialogConfig.width = '700px'; // Full size for desktop or larger screens
    }
    const dialogRef = this.dialog.open(ImportFromLibrary, dialogConfig);
    dialogRef.afterClosed().subscribe(async result => {
      console.log(result)
      if (result) {
        if (result.data?.id) {
          this.questionId = result.data?.id;
        }
        if (result.data?.question) {
          this.questionForm.controls.question.setValue(result.data?.question);
        }
        if (result.data?.answer) {
          this.questionForm.controls.answer.setValue(result.data?.answer);
        }
      }
    });
  }

  async joinGame() {
    this.loading = true;
    this.tutorialService.createTutorialGame(this.data?.data, this.questionForm.controls.question.value, this.questionForm.controls.answer.value).then(async data => {
      this.loading = false;
      if (data.status == 1) {
        this.dialogRef.close('success');
        this.generalService.startingGameTutorial = true;
        this.generalService.createdGameData = data.data;
        this.generalService.players = data.data.players;
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    }, error => {
      this.loading = false;
      this.openDialog(JSON.stringify(error.error), 'Error');
    })
  }

  updateWordCount() {
    this.wordCount = this.questionForm.controls.question.value ? (100 - this.questionForm.controls.question.value.trim().split(/\s+/).length) : 100;
  }

  updateWordCountAnswer() {
    this.wordCountAnswer = this.questionForm.controls.answer.value ? ((this.generalService.gameInit?.answerWordsLimitation) - this.questionForm.controls.answer.value.trim().split(/\s+/).length) : this.generalService.gameInit?.answerWordsLimitation;
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
