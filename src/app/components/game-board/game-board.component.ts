import {Component, Inject, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";
import {GamesService} from "../../services/games/games.service";
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatExpansionModule} from "@angular/material/expansion";
import {ConfigService} from "../../services/config/config.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {TimeDifferencePipe} from "../../time-difference.pipe";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpClient} from "@angular/common/http";
import {ParsIntPipe} from "../../pars-int.pipe";

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, TranslateModule,
    ClipboardModule, CountdownTimerComponent, CdkDropList, CdkDrag, MatExpansionModule, TimeDifferencePipe,
    ParsIntPipe],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
  providers: [CountdownTimerComponent]
})
export class GameBoardComponent implements OnInit, OnDestroy {
  @ViewChild('answerTextArea') answerTextArea: any;
  @ViewChild(CountdownTimerComponent) countdownTimer: any;
  loading: boolean = false;
  data: any;
  users: any;
  invitedUser: any;
  wordCountAnswer: number = 100;
  filteredEmails: any = [];
  sendAnswerDisable: boolean = false;
  sendRateAnswerDisable: boolean = false;
  sendRateQuestionsDisable: boolean = false;
  nextStepTriggeredAnswer: boolean = false;
  nextStepTriggeredRatingAnswer: boolean = false;
  nextStepTriggeredRatingQuestions: boolean = false;
  finishedTimerAnswer: boolean = false;
  finishedTimerRatingAnswer: boolean = false;
  finishedTimerRatingQuestions: boolean = false;
  submittedAnswer: any;
  panelOpenState: boolean[] = [];
  numberOfDisconnectingInGameSteps: any = 0;
  isModalOpen = false;
  backToCheckpoint: boolean = false;
  congratulation: boolean = false;
  isDropped: boolean = false;
  isDroppedQuestion: boolean = false;
  myRank: any;

  constructor(public generalService: GeneralService, private router: Router, private gameService: GamesService,
              public configService: ConfigService, private ngZone: NgZone, private _snackBar: MatSnackBar,
              private countdownTimerComponent: CountdownTimerComponent, public dialog: MatDialog,
              private http: HttpClient) {
    this.data = this.router.getCurrentNavigation()?.extras?.state?.['data'];
    this.users = this.router.getCurrentNavigation()?.extras?.state?.['users'];
  }

  async ngOnInit() {
    this.generalService.players = (this.data?.game?.gamePlayers);
    this.generalService.invitedPlayersArray = (this.data?.game?.gameInviteList);
    this.removeFromInvited(this.generalService.userObj?.email);
    this.generalService.socket.on("player added", (arg: any) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("player added" + ' ' + `[${timeString}]  `);
      this.generalService.players.push(arg);
      this.removeFromInvited(arg.email);
    });

    this.generalService.socket.on("next step", (arg: any) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      console.log("next step" + ' ' + `[${timeString}]  `);
      if (this.generalService.gameStep == 2) {
        this.nextStepTriggeredAnswer = true;
        this.nextStepTriggeredRatingAnswer = false;
        this.nextStepTriggeredRatingQuestions = false;
        this.finishedTimerAnswer = true;
        this.finishedTimerRatingAnswer = false;
        this.finishedTimerRatingQuestions = false;
        this.sendRateAnswerDisable = false;
      } else if (this.generalService.gameStep == 3) {
        this.nextStepTriggeredAnswer = false;
        this.nextStepTriggeredRatingAnswer = true;
        this.nextStepTriggeredRatingQuestions = false;
        this.finishedTimerAnswer = false;
        this.finishedTimerRatingAnswer = true;
        this.finishedTimerRatingQuestions = false;
        this.sendAnswerDisable = false;
        this.isDropped = false;
      } else if (this.generalService.gameStep == 4) {
        this.nextStepTriggeredAnswer = false;
        this.nextStepTriggeredRatingAnswer = false;
        this.nextStepTriggeredRatingQuestions = true;
        this.finishedTimerAnswer = false;
        this.finishedTimerRatingAnswer = false;
        this.finishedTimerRatingQuestions = true;
      }
      this.countdownTimerComponent.startCountdown();
      this.handleGameStep();
    });

    this.generalService.socket.on("submit answer", (arg: any) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("submit answer" + ' ' + `[${timeString}]  `);
      console.log(arg);
      this.submittedAnswer = arg;
    });

    this.generalService.socket.on("player left", (arg: any) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("player left" + ' ' + `[${timeString}]  `);
    });

    this.generalService.socket.on("cancel game", (arg: any) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("cancel game" + ' ' + `[${timeString}]  `);
      if (!this.generalService.isGameCancel) {
        this.generalService.isGameCancel = true;
        const dialogRef = this.dialog.open(CancelGame, {
          width: '500px',
          disableClose: true
        });
      }

    });

    this.generalService.socket.on("end game", (arg: any) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("end game" + ' ' + `[${timeString}]  `);
      this.generalService.gameStep = 5;
      this.getGameResult();
    });

    this.generalService.socket.on("disconnect", () => {
      console.log('disconnect');
      if (this.generalService?.startingGame) {
        this.generalService.disconnectedModal = this.dialog.open(Disconnected, {
          width: '500px',
          disableClose: true
        });
      }
    });
    // window.addEventListener('beforeunload', this.beforeUnloadHandler);

  }

  // @HostListener('window:beforeunload', ['$event'])
  // beforeUnloadHandler(event: BeforeUnloadEvent): void {
  //   // Custom logic before the page unloads
  //   const confirmationMessage = 'Are you sure you want to leave?';
  //   event.returnValue = confirmationMessage; // This will trigger the confirmation dialog in some browsers
  // }


  ngOnDestroy(): void {
    // this.beforeUnloadHandler
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal(event: Event) {
    // Only close the modal if the click event originated from the modal background, not the content
    // if (event.target === event.currentTarget) {
    this.isModalOpen = false;
    // }
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }

  openShareModal(type: any, data: any) {
    const dialogRef = this.dialog.open(ShareGame, {
      data: {type: type, result: data},
      width: '500px',
      disableClose: true
    });
  }

  async handleGameStep(): Promise<void> {
    // console.log("finishedTimerAnswer" + this.finishedTimerAnswer);
    // console.log("finishedTimerRatingAnswer" + this.finishedTimerRatingAnswer);
    // console.log("finishedTimerRatingQuestions" + this.finishedTimerRatingQuestions);
    // console.log("gameStep" + this.generalService.gameStep);
    if (this.generalService.gameStep == 2) {
      this.finishedTimerRatingQuestions = false;
      this.finishedTimerRatingAnswer = false;
      // console.log(this.finishedTimerAnswer)
      await this.waitForConditionsAnswer(); // Wait for conditions to be met
    } else if (this.generalService.gameStep == 3) {
      this.finishedTimerAnswer = false;
      this.finishedTimerRatingQuestions = false;
      // console.log(this.finishedTimerRatingAnswer)
      await this.waitForConditionsRatingAnswer(); // Wait for conditions to be met
    } else if (this.generalService.gameStep == 4) {
      this.finishedTimerAnswer = false;
      this.finishedTimerRatingAnswer = false;
      // console.log(this.finishedTimerRatingQuestions)
      await this.waitForConditionsRatingQuestions(); // Wait for conditions to be met
    }

    // Ensure visibility check or NgZone handling here if necessary
    await this.ngZone.run(async () => {
      switch (this.generalService.gameStep) {
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
          console.warn(`Unknown game step: ${this.generalService.gameStep}`);
      }
      if (this.submittedAnswer)
        this.submittedAnswer.numberOfSubmitted = 0;
    });
  }

  private async stepTwoLogic(): Promise<void> {
    await this.ngZone.run(async () => {
      // console.log(this.finishedTimerAnswer)
      //new method  comment waitForConditionNextStepAnswer
      await this.waitForConditionNextStepAnswer();
      // console.log('waitForConditionNextStepAnswer');
      this.generalService.gameAnswerGeneral = '';
      this.generalService.gameStep = 3;
      this.finishedTimerAnswer = false;
      const data = await this.gameService.getAllAnswersOfSpecificQuestion(
        this.generalService.createdGameData.game.gameId,
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
      const resQue = await this.gameService.getGameQuestionBasedOnStep(
        this.generalService.createdGameData.game.gameId,
        parseInt(this.generalService.gameQuestion.step) + 1
      );

      if (resQue.status === 1) {
        this.generalService.gameQuestion = resQue.data;
        this.generalService.gameAnswerGeneral = resQue.data.myAnswer || '';
        this.generalService.editingAnswer = !!resQue.data.myAnswer;
        // console.log(this.finishedTimerRatingAnswer)
        await this.waitForConditionNextStepRatingAnswer();
        this.generalService.gameStep = 2;
        this.finishedTimerRatingAnswer = false;
      } else if (resQue.status === -2) {
        const resQue = await this.gameService.getQuestionsOfGame(
          this.generalService.createdGameData.game.gameId
        );
        // console.log(this.finishedTimerRatingQuestions)
        await this.waitForConditionNextStepRatingAnswer();
        this.generalService.gameStep = 4;
        this.generalService.allQuestions = resQue.data;
        this.updateRatesQuestions(this.generalService.rateQuestions.length !== 0);
      }
    });
  }

  private async stepFourLogic(): Promise<void> {
    await this.ngZone.run(async () => {
      await this.waitForConditionNextStepQuestions()
    });
  }

  private async waitForConditionsAnswer(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.finishedTimerAnswer) {
          clearInterval(interval);
          resolve();
        }
      }, 1000); // Check every 100ms
    });
  }

  private async waitForConditionsRatingAnswer(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.finishedTimerRatingAnswer) {
          clearInterval(interval);
          resolve();
        }
      }, 1000); // Check every 100ms
    });
  }

  private async waitForConditionsRatingQuestions(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.finishedTimerRatingQuestions) {
          clearInterval(interval);
          resolve();
        }
      }, 1000); // Check every 100ms
    });
  }

  private waitForConditionNextStepAnswer(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.nextStepTriggeredAnswer) {
          clearInterval(interval);
          resolve();
        }
      }, 1000); // Check every 100ms
    });
  }

  private waitForConditionNextStepRatingAnswer(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.nextStepTriggeredRatingAnswer) {
          clearInterval(interval);
          resolve();
        }
      }, 1000); // Check every 100ms
    });
  }

  private waitForConditionNextStepQuestions(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (this.nextStepTriggeredRatingQuestions) {
          clearInterval(interval);
          resolve();
        }
      }, 1000); // Check every 100ms
    });
  }

  async getGameResult() {
    this.gameService.getGameResult(this.generalService.createdGameData.game.gameId).then(data => {
        this.generalService.gameResult = data.data;
        this.generalService.gameResult.result.scoreboard.filter((item: any, index: any) => {
          if (item._id == this.generalService.userId) {
            this.myRank = index + 1;
            console.log(this.myRank)
            console.log(index)
          }
        });
      }
    )
  }

  inviteUser() {
    if (this.invitedUser && this.invitedUser?.length > 2) {
      this.gameService.searchUserToInvite(this.invitedUser).then(data => {
        this.filteredEmails = (data.data);
      })
    }
  }

  async handleCountdownSendAnswerFinished() {
    const now = new Date();
    const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
    console.log("finishedTimer" + ' ' + `[${timeString}]  `);
    console.log("this.generalService.disconnectedModal" + this.generalService.disconnectedModal);
    this.finishedTimerAnswer = true;
    if (this.generalService.disconnectedModal == '') {
      if (!this.sendAnswerDisable) {
        await this.sendAnswer();
        this.sendAnswerDisable = true;
      } else {
        // console.log("elseeeeee")
      }
    } else {
      this.numberOfDisconnectingInGameSteps++;
      if (this.numberOfDisconnectingInGameSteps > 2) {
        this.generalService.isGameCancel = true;
        const dialogRef = this.dialog.open(ForceExitGame, {
          width: '500px',
          disableClose: true
        });
      }
      this.generalService.gameAnswerGeneral = '';
      this.generalService.gameStep = 3;
      this.nextStepTriggeredAnswer = false;
      this.nextStepTriggeredRatingAnswer = false;
      this.nextStepTriggeredRatingQuestions = false;
      this.finishedTimerAnswer = false;
      this.finishedTimerRatingAnswer = false;
      this.finishedTimerRatingQuestions = false;
      this.sendAnswerDisable = false;
      const data = await this.gameService.getAllAnswersOfSpecificQuestion(
        this.generalService.createdGameData.game.gameId,
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
        await this.sendRateAnswer(false);
        this.sendRateAnswerDisable = true;
      } else {
        // console.log("elseeeeee")
      }
    } else {
      if (this.generalService.gameQuestion?.step == this.generalService.gameInit?.numberOfPlayers) {
        this.numberOfDisconnectingInGameSteps++;
        if (this.numberOfDisconnectingInGameSteps > 2) {
          this.generalService.isGameCancel = true;
          const dialogRef = this.dialog.open(ForceExitGame, {
            width: '500px',
            disableClose: true
          });
        }
        this.generalService.gameStep = 4;
        const resQue = await this.gameService.getQuestionsOfGame(
          this.generalService.createdGameData.game.gameId
        );
        this.generalService.allQuestions = resQue.data;
        this.updateRatesQuestions(this.generalService.rateQuestions.length !== 0);
      } else {
        this.numberOfDisconnectingInGameSteps++;
        if (this.numberOfDisconnectingInGameSteps > 2) {
          this.generalService.isGameCancel = true;
          const dialogRef = this.dialog.open(ForceExitGame, {
            width: '500px',
            disableClose: true
          });
        }
        this.generalService.gameStep = 2;
        this.nextStepTriggeredAnswer = false;
        this.nextStepTriggeredRatingAnswer = false;
        this.nextStepTriggeredRatingQuestions = false;
        this.finishedTimerAnswer = false;
        this.finishedTimerRatingAnswer = false;
        this.finishedTimerRatingQuestions = false;
        this.sendRateAnswerDisable = false;
        const resQue = await this.gameService.getGameQuestionBasedOnStep(
          this.generalService.createdGameData.game.gameId,
          parseInt(this.generalService.gameQuestion.step) + 1
        );
        if (resQue.status === 1) {
          this.generalService.gameQuestion = resQue.data;
          this.generalService.gameAnswerGeneral = resQue.data.myAnswer || '';
          this.generalService.editingAnswer = !!resQue.data.myAnswer;
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
      this.numberOfDisconnectingInGameSteps++;
      if (this.numberOfDisconnectingInGameSteps > 2) {
        this.generalService.isGameCancel = true;
        const dialogRef = this.dialog.open(ForceExitGame, {
          width: '500px',
          disableClose: true
        });
      }
      this.generalService.gameStep = 5;
      await this.getGameResult();
      // console.log("elseeeeee")
    }
  }

  restartCountdown() {
    this.countdownTimer.startCountdown();
  }

  async sendAnswer(): Promise<any> {
    await this.ngZone.run(async () => {
      this.sendAnswerDisable = true;
      this.sendRateAnswerDisable = false;
      this.numberOfDisconnectingInGameSteps = 0;
      this.gameService.sendAnswer(this.generalService.createdGameData.game.gameId, this.generalService.gameQuestion._id, this.generalService.gameAnswerGeneral).then(data => {
        if (data.status == 1) {
          this.loading = false;
          this.generalService.editingAnswer = true;
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
      this.numberOfDisconnectingInGameSteps = 0;
      if (!dropped && this.isDropped) {
        await this.updateRates(true);
      } else if (dropped) {
        await this.updateRates(true);
      }
      this.gameService.sendRates(this.generalService.createdGameData.game.gameId, this.generalService.gameQuestion._id, this.generalService.rateAnswers).then(data => {
        if (data.status == 1) {
          this.loading = false;
        } else {
          this.loading = false;
        }
      })
    });
  }

  async sendRateQuestions(dropped: any = false): Promise<any> {
    this.sendRateQuestionsDisable = true;
    this.sendRateAnswerDisable = false;
    this.numberOfDisconnectingInGameSteps = 0;
    if (!dropped && this.isDroppedQuestion) {
      await this.updateRatesQuestions(true);
    } else if (dropped) {
      await this.updateRatesQuestions(true);
    }
    this.gameService.sendRateQuestions(this.generalService.createdGameData.game.gameId, this.generalService.rateQuestions).then(data => {
      if (data.status == 1) {
        this.loading = false;
      } else {
        this.loading = false;
      }
    })
  }

  updateWordCountAnswer() {
    this.wordCountAnswer = this.generalService?.gameAnswerGeneral ? (100 - this.generalService?.gameAnswerGeneral.trim().split(/\s+/).length) : 100;
  }

  editAnswer() {
    this.generalService.editingAnswer = false;
  }

  removeFromInvited(email: any) {
    const index = this.generalService.invitedPlayersArray.findIndex((data: any) => data === email);
    if (index !== -1) {
      // Remove the item from the array
      this.generalService.invitedPlayersArray.splice(index, 1);
    }
  }

  async newGame() {
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
    this.submittedAnswer = null;
    await this.router.navigate(['/games/1']);
  }

  isEmailFormat(input: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(input);
  }

  addEmailToInvited(email: any) {
    if (this.isEmailFormat(email)) {
      this.filteredEmails = [];
      this.gameService.invitePlayer(this.generalService.createdGameData.game.gameId, email).then(data => {
        if (data.status == 1) {
          this.invitedUser = '';
          this.generalService.invitedPlayersArray.push(email);
        } else {
          this.invitedUser = '';
        }
      })
    }
  }

  selectUserToInvite(user: any) {
    this.invitedUser = user?.email;
    this.filteredEmails = [];
    this.addUserToPlayers();
  }

  addUserToPlayers() {
    console.log(this.invitedUser);
    this.gameService.invitePlayer(this.generalService.createdGameData.game.gameId, this.invitedUser).then(data => {
      if (data.status == 1) {
        this.generalService.invitedPlayersArray.push(this.invitedUser);
        this.invitedUser = '';
      } else {
        this.invitedUser = '';
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

  downloadImage(url: any) {
    this.http.get(url, {responseType: 'blob'}).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'image.png';
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  openScoreModal(score: any, totalScore: any) {
    const dialogRef = this.dialog.open(Score, {
      data: {score, totalScore},
      width: '600px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'close') {
        // this.backToCheckpoint = true;
      } else if (result == 'keep') {
        this.congratulation = true;
      }
    });
  }

  backToCheckpointMethod() {
    this.gameService.backToCheckpoint(this.generalService.createdGameData.game.gameId).then(data => {
      if (data.status == 1) {
        this.backToCheckpoint = true;
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    })
  }
}

@Component({
  selector: 'cancel-game',
  templateUrl: 'cancel-game.html',
  standalone: true,
  imports: [MaterialModule, CommonModule]
})

export class CancelGame {

  constructor(public dialogRef: MatDialogRef<CancelGame>, private generalService: GeneralService,
              private router: Router) {
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
    this.dialogRef.close();
    await this.router.navigate(['/dashboard']);
  }
}


@Component({
  selector: 'disconnected',
  templateUrl: 'disconnected.html',
  standalone: true,
  imports: [MaterialModule, CommonModule]
})

export class Disconnected {

  constructor(public dialogRef: MatDialogRef<Disconnected>, private generalService: GeneralService,
              private router: Router) {
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
    this.dialogRef.close();
    await this.router.navigate(['/dashboard']);
  }
}


@Component({
  selector: 'force-exit-game',
  templateUrl: 'force-exit-game.html',
  standalone: true,
  imports: [MaterialModule, CommonModule]
})

export class ForceExitGame {

  constructor(public dialogRef: MatDialogRef<ForceExitGame>, private generalService: GeneralService,
              private router: Router) {
    this.gotoHome();
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
    // this.dialogRef.close();
    await this.router.navigate(['/dashboard']);
  }
}

@Component({
  selector: 'share',
  templateUrl: 'share.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, TranslateModule, ClipboardModule]
})

export class ShareGame {
  type: any;
  result: any;

  constructor(public dialogRef: MatDialogRef<ShareGame>,
              private router: Router, @Inject(MAT_DIALOG_DATA) public data: any,) {
    this.type = this.data.type;
    this.result = this.data.result;
  }

  async closeModal() {
    this.dialogRef.close();
  }

  async shareTelegram(text: any) {
    if (this.type == '') {
      const base64url = this.result
      const blob = await (await fetch(base64url)).blob();
      const file = new File([blob], '1qma.png', {type: blob.type});
      navigator.share({
        title: 'Hello',
        text: 'Welcome to 1QMA Games!',
        files: [file],
      })
      this.dialogRef.close();
    } else {
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('')}&text=${encodeURIComponent(text)}`;
      window.open(telegramUrl, '_blank');
      this.dialogRef.close();
    }

  }

  shareWhatsapp(text: any) {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    this.dialogRef.close();
  }

  shareFacebook(url: any, text: any) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, '_blank');
    this.dialogRef.close();
  }

  shareXMedia(text: any) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
    this.dialogRef.close();
  }

}

@Component({
  selector: 'score',
  templateUrl: 'score.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, TranslateModule, ClipboardModule, ParsIntPipe]
})

export class Score {

  constructor(public dialogRef: MatDialogRef<Score>, private gameService: GamesService,
              private router: Router, @Inject(MAT_DIALOG_DATA) public data: any,
              private _snackBar: MatSnackBar, public generalService: GeneralService) {

  }

  async closeModal(text: any) {
    if (text == 'keep') {
      await this.gameService.keepMyScore(this.generalService.createdGameData.game.gameId).then(data => {
        if (data.status == 1) {
          this.dialogRef.close(text);
        } else {
          this.openDialog(JSON.stringify(data.message), 'Error');
        }
      });
    } else {
      this.dialogRef.close(text);
    }
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
