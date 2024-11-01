import {Component, HostListener, Inject, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {TimeDifferencePipe} from "../../pipes/time-difference.pipe";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpClient} from "@angular/common/http";
import {ParsIntPipe} from "../../pipes/pars-int.pipe";
import translate from "translate";
import {ExitGame} from "../../shared/header/header.component";
import {franc} from "franc";
import iso6391 from "iso-639-1";
import {io} from "socket.io-client";

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
  @ViewChild('tooltip1') tooltip1!: any;
  @ViewChild('tooltip2') tooltip2!: any;
  loading: boolean = false;
  data: any;
  invitedUser: any;
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
  submittedAnswer: any = {};
  panelOpenState: boolean[] = [];
  numberOfDisconnectingInGameSteps: any = 0;
  isModalOpen = false;
  backToCheckpoint: boolean = false;
  congratulation: boolean = false;
  isDropped: boolean = false;
  isDroppedQuestion: boolean = false;
  myRank: any;
  tooltipVisible1 = false;  // Control whether the tooltip is visible
  tooltipMessage1 = 'Click to copy!';
  tooltipVisible2 = false;  // Control whether the tooltip is visible
  tooltipMessage2 = 'Click to copy!';
  isDropListDisabled: boolean = false;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = 'You have unsaved changes! Are you sure you want to leave?';

      // Call exitGame with useBeacon set to true
      this.gameService.exitGame(this.generalService.createdGameData.game.gameId, true);
    }
  }

  hasUnsavedChanges(): boolean {
    // Logic to determine if there are unsaved changes
    // This can be replaced with actual condition to track unsaved changes
    return true; // Example: return true if there are unsaved changes
  }

  constructor(public generalService: GeneralService, private router: Router, private gameService: GamesService,
              public configService: ConfigService, private ngZone: NgZone, private _snackBar: MatSnackBar,
              private countdownTimerComponent: CountdownTimerComponent, public dialog: MatDialog,
              private http: HttpClient) {
    this.data = this.router.getCurrentNavigation()?.extras?.state?.['data'];
    //numberOfSubmitted maybe remove it
    this.submittedAnswer.numberOfSubmitted = 1;
  }

  async ngOnInit() {
    // this.generalService.useGoogleTranslate();
    this.generalService.wordCountAnswer = this.generalService.gameInit?.answerWordsLimitation;
    this.generalService.players = (this.data?.game?.gamePlayers);
    this.generalService.invitedPlayersArray = (this.data?.game?.gameInviteList);
    this.generalService.invitedPlayersArray = this.generalService.invitedPlayersArray.filter(
      (invitedPlayer: any) => !this.generalService.players.some(
        (player: any) => player.email === invitedPlayer.email
      )
    );
    console.log(this.data)
    console.log(this.generalService.invitedPlayersArray)
    await this.removeFromInvited(this.generalService.userObj?.email);
    this.generalService.socket.on("player added", async (arg: any) => {
      console.log("player added " + arg);
      console.log(this.generalService.players);
      // if (!this.generalService.players.some((player: any) => player.email === arg.email)) {
      //   this.generalService.players.push(arg);
      // }
      if (this.generalService.disconnectedModal) {
        this.generalService.disconnectedModal.close();
        this.generalService.disconnectedModal = '';
      }
      if (!this.generalService.players.some((player: any) => player.email === arg.email) &&
        !this.generalService.invitedPlayersArray.some((player: any) => player.email === arg.email)) {
        this.generalService.players.push(arg);
      }

      await this.removeFromInvited(arg.email);
    });

    this.generalService.socket.on("next step", (arg: any) => {
      if (this.generalService.disconnectedModal) {
        this.generalService.disconnectedModal.close();
        this.generalService.disconnectedModal = '';
      }
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
        this.countdownTimer.resetTimer(3);
      } else if (this.generalService.gameStep == 3) {
        this.generalService.wordCountAnswer = this.generalService.gameInit?.answerWordsLimitation;
        this.nextStepTriggeredAnswer = false;
        this.nextStepTriggeredRatingAnswer = true;
        this.nextStepTriggeredRatingQuestions = false;
        this.finishedTimerAnswer = false;
        this.finishedTimerRatingAnswer = true;
        this.finishedTimerRatingQuestions = false;
        this.sendAnswerDisable = false;
        this.isDropped = false;
        console.log(this.generalService?.gameQuestion)
        this.countdownTimer.resetTimer(this.generalService.gameInit?.numberOfPlayers == parseInt(this.generalService.gameQuestion?.step) ? 4 : 2);
      } else if (this.generalService.gameStep == 4) {
        this.nextStepTriggeredAnswer = false;
        this.nextStepTriggeredRatingAnswer = false;
        this.nextStepTriggeredRatingQuestions = true;
        this.finishedTimerAnswer = false;
        this.finishedTimerRatingAnswer = false;
        this.finishedTimerRatingQuestions = true;
        this.countdownTimer.resetTimer(3);
      }
      this.countdownTimerComponent.startCountdown();
      this.handleGameStep();
    });

    this.generalService.socket.on("submit answer", (arg: any) => {
      if (this.generalService.disconnectedModal) {
        this.generalService.disconnectedModal.close();
        this.generalService.disconnectedModal = '';
      }
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("submit answer" + ' ' + `[${timeString}]  `);
      console.log(arg);
      this.submittedAnswer = arg;
    });

    this.generalService.socket.on("player left", (arg: any) => {
      if (this.generalService.disconnectedModal) {
        this.generalService.disconnectedModal.close();
        this.generalService.disconnectedModal = '';
      }
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("player left" + ' ' + `[${timeString}]  `);
    });

    this.generalService.socket.on("cancel game", (arg: any) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("cancel game" + ' ' + `[${timeString}]  `);
      if (this.generalService.disconnectedModal) {
        this.generalService.disconnectedModal.close();
        this.generalService.disconnectedModal = '';
      }
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
      if (this.generalService.disconnectedModal) {
        this.generalService.disconnectedModal.close();
        this.generalService.disconnectedModal = '';
      }
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
        this.stopKeepAlive();
        this.reconnect(); // Attempt to reconnect
      }
    });
  }

  reconnect() {
    setTimeout(() => {
      this.connect();
    }, 1000); // Try to reconnect after 1 second
  }

  connect() {
    this.generalService.socket = io('https://api.staging.1qma.games', {
      reconnection: true,
      timeout: 5000,
      withCredentials: true
    });

    // Listen for connection and disconnection events
    this.generalService.socket.on('connect', () => {
      if (this.generalService.disconnectedModal) {
        this.generalService.disconnectedModal.close();
        this.generalService.disconnectedModal = '';
      }
      console.log('Socket connected');
      this.startKeepAlive();
    });

    this.generalService.socket.on('disconnect', () => {
      console.log('disconnect');
      if (this.generalService?.startingGame) {
        this.generalService.disconnectedModal = this.dialog.open(Disconnected, {
          width: '500px',
          disableClose: true
        });
        this.stopKeepAlive();
        this.reconnect(); // Attempt to reconnect
      }
    });
  }

  startKeepAlive() {
    this.generalService.keepAliveInterval = setInterval(() => {
      if (this.generalService.socket.connected) {
        console.log('Sending ping...');
        this.generalService.socket.emit('ping'); // Send a ping message to the server
      }
    }, 1000); // Send ping every 30 seconds
  }


  stopKeepAlive() {
    clearInterval(this.generalService.keepAliveInterval);
  }

  // @HostListener('window:beforeunload', ['$event'])
  // beforeUnloadHandler(event: BeforeUnloadEvent): void {
  //   // Custom logic before the page unloads
  //   const confirmationMessage = 'Are you sure you want to leave?';
  //   event.returnValue = confirmationMessage; // This will trigger the confirmation dialog in some browsers
  // }

  showTooltip1() {
    this.tooltip1.show();
    // this.tooltipVisible = true;  // Set tooltip visibility to true
    this.tooltipMessage1 = 'Copied!';
    // Hide tooltip after 2 seconds
    setTimeout(() => {
      this.tooltip1.hide();
      setTimeout(() => {
        this.tooltipMessage1 = 'Click to copy!';
      }, 500);
      // this.tooltipVisible = false;  // Reset tooltip visibility
    }, 1000);
  }

  showTooltip2() {
    this.tooltip2.show();
    // this.tooltipVisible = true;  // Set tooltip visibility to true
    this.tooltipMessage2 = 'Copied!';
    // Hide tooltip after 2 seconds
    setTimeout(() => {
      this.tooltip2.hide();
      setTimeout(() => {
        this.tooltipMessage2 = 'Click to copy!';
      }, 500);
      // this.tooltipVisible = false;  // Reset tooltip visibility
    }, 1000);
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

  async gotoReportPage() {
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
    clearInterval(this.generalService.keepAliveInterval);
    this.submittedAnswer = null;
    await this.router.navigate(['/report-bug']);

  }

  async openShareModalQR(type: any, data: any) {
    const base64url = data
    const blob = await (await fetch(base64url)).blob();
    const file = new File([blob], '1qma.png', {type: blob.type});
    this.generalService.share({
      title: 'Hello! Welcome to 1QMA Games!',
      text: data,
      files: [file],
    })
  }

  async openShareModal(type: any, data: any) {
    this.generalService.share({
      title: 'Hello! Welcome to 1QMA Games!',
      text: data,
    })
  }

  async handleGameStep(): Promise<void> {
    console.log("finishedTimerAnswer" + this.finishedTimerAnswer);
    console.log("finishedTimerRatingAnswer" + this.finishedTimerRatingAnswer);
    console.log("finishedTimerRatingQuestions" + this.finishedTimerRatingQuestions);
    console.log("gameStep" + this.generalService.gameStep);
    //maybe
    this.generalService.specificQuestionAnswers = '';
    this.isDropListDisabled = false;

    if (this.generalService.gameStep == 2) {
      // this.generalService.wordCountAnswer = 100;
      this.finishedTimerRatingQuestions = false;
      this.finishedTimerRatingAnswer = false;
      // console.log(this.finishedTimerAnswer)
      await this.waitForConditionsAnswer(); // Wait for conditions to be met
    } else if (this.generalService.gameStep == 3) {
      this.finishedTimerAnswer = false;
      this.finishedTimerRatingQuestions = false;
      this.nextStepTriggeredAnswer = false;
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
      this.generalService.gameAnswerGeneral = '';
      this.generalService.gameStep = 3;
      this.finishedTimerAnswer = false;
      const data = await this.gameService.getAllAnswersOfSpecificQuestion(
        this.generalService.createdGameData.game.gameId,
        this.generalService.gameQuestion._id
      );

      if (data.status === 1) {
        this.generalService.specificQuestionAnswers = data.data;
        if (this.generalService.selectedTranslatedLanguage) {
          for (const answer of this.generalService.specificQuestionAnswers.answers) {
            answer.answer = await this.detectAndTranslate(answer.answer, this.generalService.selectedTranslatedLanguage);
          }
        }
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
        if (this.generalService.selectedTranslatedLanguage) {
          this.generalService.gameQuestion.question = await this.detectAndTranslate(resQue?.data.question,
            this.generalService.selectedTranslatedLanguage);
        }

        this.generalService.gameAnswerGeneral = resQue.data.myAnswer || '';
        this.generalService.editingAnswer = !!resQue.data.myAnswer;
        // if(resQue.data.myAnswer){
        this.updateWordCountAnswer();
        // }
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
        if (this.generalService.selectedTranslatedLanguage) {
          for (const question of this.generalService.allQuestions) {
            question.question = await this.detectAndTranslate(question.question, this.generalService.selectedTranslatedLanguage);
          }
        }
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
    this.gameService.getGameResult(this.generalService.createdGameData.game.gameId).then(async data => {
        this.generalService.gameResult = data.data;
        if (this.generalService.selectedTranslatedLanguage) {
          for (const question of this.generalService.gameResult.result.details) {
            question.question = await this.detectAndTranslate(question.question,
              this.generalService.selectedTranslatedLanguage);
            for (const answer of question.answers) {
              answer.answer = await this.detectAndTranslate(answer.answer, this.generalService.selectedTranslatedLanguage);
            }
          }
        }
        this.generalService.gameResult.result.scoreboard.filter((item: any, index: any) => {
          if (item._id == this.generalService.userId) {
            this.myRank = index + 1;
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
        // this.countdownTimer.resetTimer(3);
        await this.sendAnswer();
        this.sendAnswerDisable = true;
      } else {
        console.log("elseeeeee");
        //   this.generalService.gameAnswerGeneral = '';
        //   this.generalService.gameStep = 3;
        //   this.nextStepTriggeredAnswer = false;
        //   this.nextStepTriggeredRatingAnswer = false;
        //   this.nextStepTriggeredRatingQuestions = false;
        //   this.finishedTimerAnswer = false;
        //   this.finishedTimerRatingAnswer = false;
        //   this.finishedTimerRatingQuestions = false;
        //   this.sendAnswerDisable = false;
        //   const data = await this.gameService.getAllAnswersOfSpecificQuestion(
        //     this.generalService.createdGameData.game.gameId,
        //     this.generalService.gameQuestion._id
        //   );
        //
        //   if (data.status === 1) {
        //     this.generalService.specificQuestionAnswers = data.data;
        //     // for (const answer of this.generalService.specificQuestionAnswers.answers) {
        //     //   answer.answer = await translate(answer.answer, {
        //     //     to:
        //     //       this.generalService?.userObj?.preferedLanguage == '0' ? 'en' :
        //     //         this.generalService.userObj?.preferedLanguage == '1' ? 'de' : 'fa', from: answer.language
        //     //   });
        //     // }
        //     this.updateRates(this.generalService.rateAnswers.length !== 0);
        //   }
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
      this.countdownTimer.resetTimer(3);
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
        // for (const answer of this.generalService.specificQuestionAnswers.answers) {
        //   answer.answer = await translate(answer.answer, this.generalService.selectedTranslatedLanguage);
        // }
        if (this.generalService.selectedTranslatedLanguage) {
          for (const answer of this.generalService.specificQuestionAnswers.answers) {
            answer.answer = await this.detectAndTranslate(answer.answer, this.generalService.selectedTranslatedLanguage);
          }
        }
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
        /* // maybe
        // await this.sendRateAnswer(false);
         //*/
        // this.generalService.gameStep = 2;
        // this.nextStepTriggeredAnswer = false;
        // this.nextStepTriggeredRatingAnswer = false;
        // this.nextStepTriggeredRatingQuestions = false;
        // this.finishedTimerAnswer = false;
        // this.finishedTimerRatingAnswer = false;
        // this.finishedTimerRatingQuestions = false;
        // this.sendRateAnswerDisable = false;
        // const resQue = await this.gameService.getGameQuestionBasedOnStep(
        //   this.generalService.createdGameData.game.gameId,
        //   parseInt(this.generalService.gameQuestion.step) + 1
        // );
        // if (resQue.status === 1) {
        //   this.generalService.gameQuestion = resQue.data;
        //   // this.generalService.gameQuestion.question = await translate(this.generalService.gameQuestion.question,
        //   //   {
        //   //     to: this.generalService?.userObj?.preferedLanguage == '0' ? 'en' :
        //   //       this.generalService.userObj?.preferedLanguage == '1' ? 'de' : 'fa',
        //   //     from: this.generalService.gameQuestion.language
        //   //   });
        //   this.generalService.gameAnswerGeneral = resQue.data.myAnswer || '';
        //   this.generalService.editingAnswer = !!resQue.data.myAnswer;
        //   // if(resQue.data.myAnswer){
        //   this.updateWordCountAnswer();
        //   // }
        // }
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
        this.countdownTimer.resetTimer(4);
        const resQue = await this.gameService.getQuestionsOfGame(
          this.generalService.createdGameData.game.gameId
        );
        this.generalService.allQuestions = resQue.data;
        if (this.generalService.selectedTranslatedLanguage) {
          for (const question of this.generalService.allQuestions.questions) {
            question.question = await this.detectAndTranslate(question.question,
              this.generalService.selectedTranslatedLanguage);
          }
        }
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
        this.countdownTimer.resetTimer(2);
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
          if (this.generalService.selectedTranslatedLanguage) {
            this.generalService.gameQuestion.question = await this.detectAndTranslate(this.generalService.gameQuestion.question,
              this.generalService.selectedTranslatedLanguage);
          }
          this.generalService.gameAnswerGeneral = resQue.data.myAnswer || '';
          this.generalService.editingAnswer = !!resQue.data.myAnswer;
          // if(resQue.data.myAnswer){
          this.updateWordCountAnswer();
          // }
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
      // this.countdownTimer.resetTimer(2);
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

  // restartCountdown() {
  //   this.countdownTimer.startCountdown();
  // }

  async openWaitingModal() {
    this.generalService.waitingModal = this.dialog.open(WaitingModal, {
      width: '500px',
      disableClose: true
    });
    this.generalService.waitingModal.afterClosed().subscribe(async (result: any) => {
      if (result == 'close') {
        // this.backToCheckpoint = true;
      } else if (result == 'keep') {
        this.countdownTimer.resetTimer(0);
      }
    });
  }

  async detectAndTranslate(question: string, targetLanguage: string) {
    const detectedLangISO6393 = franc(question);
    console.log(detectedLangISO6393);  // This should log 'prs' for Dari Persian

    let detectedLangISO6391 = iso6391.getCode(detectedLangISO6393);
    if (!detectedLangISO6391) {
      if (detectedLangISO6393 === 'prs' || detectedLangISO6393 === 'fas' || detectedLangISO6393 === 'pes' ||
        detectedLangISO6393 === 'und' && /[\u0600-\u06FF]/.test(question)) {
        detectedLangISO6391 = 'fa';  // Map Dari and Persian to 'fa'
      } else {
        console.warn(`Detected language (${detectedLangISO6393}) has no ISO 639-1 equivalent. Defaulting to 'en'.`);
        detectedLangISO6391 = 'fa';  // Fallback to English or another default
      }
    }

    console.log(detectedLangISO6391);
    console.log(targetLanguage);

// Perform the translation
    const translatedText = await translate(question, {
      from: detectedLangISO6391,
      to: targetLanguage,
    });
    return translatedText;
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
      this.isDropListDisabled = true;
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
    this.isDropListDisabled = true;
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
    this.generalService.wordCountAnswer = this.generalService?.gameAnswerGeneral ? ((this.generalService.gameInit?.answerWordsLimitation) - this.generalService?.gameAnswerGeneral.trim().split(/\s+/).length) : this.generalService.gameInit?.answerWordsLimitation;
  }

  editAnswer() {
    //maybe
    this.sendAnswerDisable = false;
    //
    this.generalService.editingAnswer = false;
    this.gameService.editAnswer(this.generalService.createdGameData.game.gameId, this.generalService.gameQuestion._id).then(data => {
      if (data.status == 1) {
      }
    })
  }

  async removeFromInvited(email: any) {
    const index = this.generalService.invitedPlayersArray.findIndex((data: any) => data === email);
    if (index !== -1) {
      // Remove the item from the array
      this.generalService.invitedPlayersArray.splice(index, 1);
      console.log('removeFromInvited' + this.generalService.invitedPlayersArray)
    }
  }

  async newGame() {
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
    clearInterval(this.generalService.keepAliveInterval);
    this.submittedAnswer = null;
    await this.router.navigate(['/games/create-game']);
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
    const dialogConfig = new MatDialogConfig();
    if (this.generalService.isMobileView) { // Assuming mobile devices are <= 768px
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.height = 'auto'; // You can specify the height if needed
      dialogConfig.position = {bottom: '0px'};
      dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
      dialogConfig.data = {score, totalScore};
      dialogConfig.disableClose = true;
    } else {
      dialogConfig.width = '600px'; // Full size for desktop or larger screens
      dialogConfig.data = {score, totalScore};
      dialogConfig.disableClose = true;

    }
    const dialogRef = this.dialog.open(Score, dialogConfig);
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

  ngOnDestroy(): void {
    // Clear Google Translate settings when leaving the page
    // this.generalService.clearGoogleTranslateSettings();
  }

  disableCopyPaste(event: ClipboardEvent) {
    event.preventDefault();
  }
}

@Component({
  selector: 'cancel-game',
  templateUrl: 'cancel-game.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, TranslateModule]
})

export class CancelGame {

  constructor(public dialogRef: MatDialogRef<CancelGame>, private generalService: GeneralService,
              private router: Router) {
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
    clearInterval(this.generalService.keepAliveInterval);
    this.dialogRef.close();
    await this.router.navigate(['/dashboard']);
  }
}


@Component({
  selector: 'disconnected',
  templateUrl: 'disconnected.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, TranslateModule, CountdownTimerComponent],
  providers: [CountdownTimerComponent]
})

export class Disconnected {
  disable: boolean = true;

  constructor(public dialogRef: MatDialogRef<Disconnected>, private generalService: GeneralService,
              private router: Router) {
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
    clearInterval(this.generalService.keepAliveInterval);
    this.dialogRef.close();
    await this.router.navigate(['/dashboard']);
  }

  finishedDisconnectTimer() {
    this.disable = false;
  }
}


@Component({
  selector: 'force-exit-game',
  templateUrl: 'force-exit-game.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, TranslateModule]
})

export class ForceExitGame {

  constructor(public dialogRef: MatDialogRef<ForceExitGame>, private generalService: GeneralService,
              private router: Router) {
    this.gotoHome();
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
    clearInterval(this.generalService.keepAliveInterval);
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

  constructor(public dialogRef: MatDialogRef<ShareGame>, public generalService: GeneralService,
              private router: Router, @Inject(MAT_DIALOG_DATA) public data: any,) {
    this.type = this.data.type;
    this.result = this.data.result;
  }

  async closeModal() {
    this.dialogRef.close();
  }

  async shareTelegram(text: any) {
    // if (this.type == '') {
    const base64url = this.result
    const blob = await (await fetch(base64url)).blob();
    const file = new File([blob], '1qma.png', {type: blob.type});
    this.generalService.share({
      title: 'Hello! Welcome to 1QMA Games!',
      text: text,
      files: [file],
    })
    // navigator.share({
    //   title: 'Hello',
    //   text: 'Welcome to 1QMA Games!',
    //   files: [file],
    // })
    this.dialogRef.close();
    // } else {
    //   const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('')}&text=${encodeURIComponent(text)}`;
    //   window.open(telegramUrl, '_blank');
    //   this.dialogRef.close();
    // }

  }

  async shareWhatsapp(text: any) {
    // const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    // window.open(whatsappUrl, '_blank');
    const base64url = this.result
    const blob = await (await fetch(base64url)).blob();
    const file = new File([blob], '1qma.png', {type: blob.type});
    this.generalService.share({
      title: 'Hello! Welcome to 1QMA Games!',
      text: text,
      files: [file],
    })
    this.dialogRef.close();
  }

  async shareFacebook(url: any, text: any) {
    // const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    // window.open(facebookUrl, '_blank');
    const base64url = this.result
    const blob = await (await fetch(base64url)).blob();
    const file = new File([blob], '1qma.png', {type: blob.type});
    this.generalService.share({
      title: 'Hello! Welcome to 1QMA Games!',
      text: text,
      files: [file],
    })
    this.dialogRef.close();
  }

  async shareXMedia(text: any) {
    // const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    // window.open(twitterUrl, '_blank');
    const base64url = this.result
    const blob = await (await fetch(base64url)).blob();
    const file = new File([blob], '1qma.png', {type: blob.type});
    this.generalService.share({
      title: 'Hello! Welcome to 1QMA Games!',
      text: text,
      files: [file],
    })
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

@Component({
  selector: 'waiting-modal',
  templateUrl: 'waiting-modal.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, TranslateModule],
  providers: [CountdownTimerComponent]
})

export class WaitingModal {

  constructor(public dialogRef: MatDialogRef<WaitingModal>, private generalService: GeneralService,
              private router: Router, private gameService: GamesService) {
  }

  async resetTimer() {
    this.dialogRef.close('keep');
  }

  async gotoHome() {
    const data = await this.gameService.exitGame(this.generalService?.startingGame ? this.generalService?.createdGameData?.game?.gameId : this.generalService?.createdGameData?._id);
    if (data.status === 1) {
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
      clearInterval(this.generalService.keepAliveInterval);
      this.dialogRef.close(true);
      await this.router.navigate(['/dashboard']);
    }
  }
}
