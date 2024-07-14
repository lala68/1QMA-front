import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {GamesService} from "../../services/games/games.service";
import {DialogContentComponent} from "../dialog-content/dialog-content.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {ConfigService} from "../../services/config/config.service";
import {ClientService} from "../../services/client/client.service";
import {io} from "socket.io-client";
import {GameBoardComponent} from "../game-board/game-board.component";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    TranslateModule],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss',
  providers: [GameBoardComponent, CountdownTimerComponent],
  encapsulation: ViewEncapsulation.None
})
export class GamesComponent implements OnInit {
  loading: boolean = true;
  createGameStep: any = 1;
  selectedGameMode: any;
  selectedGameType: any = [];
  selectedCategory: any = [];
  inviteForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  invitedArray: any = [];
  wordCount: number = 100;
  wordCountAnswer: number = 100;
  questionForm = this._formBuilder.group({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', [Validators.required]),
  });
  gameCode: any;
  userEmail: any;
  filteredEmails: any = [];
  private timer: any;
  findFriendStep: any = 1;
  findFriendGameData: any;
  selectedTabIndex: any = 0;
  loadingJoinWithCode: boolean = false;
  loadingFindFriend: boolean = false;
  loadingCreateGame: boolean = false;
  nextStepTriggered: boolean = false;

  constructor(public generalService: GeneralService, private gameService: GamesService, public configService: ConfigService,
              private _formBuilder: FormBuilder, private router: Router, public dialog: MatDialog,
              private route: ActivatedRoute, private gameBoardComponent: GameBoardComponent, private countdownTimerComponent: CountdownTimerComponent) {
    this.generalService.currentRout = '/games/0';
  }

  async ngOnInit(): Promise<any> {
    this.gameService.gameInit().then(data => {
      if (data.status == 1) {
        this.generalService.gameInit = data.data;
        this.loading = false;
      }
    });
    this.route.paramMap.subscribe(params => {
      this.selectedTabIndex = params.get('id');
    });
  }

  async gotoStepTwo(index: any) {
    this.selectedGameMode = index;
    if (this.selectedGameMode == 0 || this.selectedGameMode == 2) {
      await this.chooseRandomCategory();
    }
    this.createGameStep = 2;
  }

  resetData() {
    this.selectedCategory = [];
    this.selectedGameMode = '';
    this.selectedGameType = [];
    this.createGameStep = 1;
    this.findFriendStep = 1;
  }

  async chooseRandomCategory() {
    const randomIndex = Math.floor(Math.random() * this.generalService.clientInit.categories.length);
    const randomItem = this.generalService.clientInit.categories[randomIndex];
    this.selectedCategory.push(randomItem);
  }

  async startingGame() {
    this.loadingCreateGame = true;
    this.generalService.players = [];
    this.generalService.socket = io('https://api.staging.1qma.games', {withCredentials: true});
    this.generalService.socket.on("connect", () => {
      console.log("connect");
    });
    this.generalService.socket.on("player added", (arg: any) => {
      console.log("emit", arg);
      this.generalService.players.push(arg);
    });

    this.generalService.socket.on("start game", (arg: any) => {
      console.log("emit game started", arg);
      this.gameService.getGameQuestionBasedOnStep(this.generalService?.createdGameData?.game?.gameId, 1).then(resQue => {
        this.generalService.gameQuestion = resQue?.data;
        this.generalService.gameStep = 2;
        this.generalService.finishedTimer = false;
        this.handleGameStep();
        if (resQue?.data?.myAnswer) {
          this.generalService.gameAnswerGeneral = resQue?.data?.myAnswer;
          this.generalService.editingAnswer = true;
        } else {
          this.generalService.editingAnswer = false;
        }
      })
    });

    this.generalService.socket.on("next step", (arg: any) => {
      console.log("emit next step", arg);
      this.nextStepTriggered = true;
      // this.handleGameStep();
    });

    this.generalService.socket.on("end game", (arg: any) => {
      console.log("end game", arg);
      // this.waitForConditions().then(async () => {
      this.generalService.gameStep = 5;
      this.getGameResult();
      // });
    });

    this.generalService.socket.on("disconnected", function () {
      console.log('disconnected')
    });
    setTimeout(() => {
      this.gameService.createGame(this.selectedGameType[0], this.selectedGameMode.toString(), this.selectedCategory,
        this.invitedArray, this.questionForm.controls.question.value, this.questionForm.controls.answer.value)
        .then(async data => {
          if (data.status == 1) {
            this.generalService.startingGame = true;
            let account = await this.generalService.getItem('account');
            if (account) {
              // Update the "assets" property
              account.assets = data?.data?.newBalance;
              // Save the updated "account" object back to storage
              this.generalService.saveToStorage('account', JSON.stringify(account));
            }
            this.generalService.createdGameData = data.data;
            await this.router.navigate(['/game-board'], {state: {data: data.data, users: this.invitedArray}});
            // await this.router.navigate(['/game-board'], {state: {data: '', users: this.invitedArray}});
          } else {
            this.loadingCreateGame = false;
            this.openDialog(JSON.stringify(data.message), 'Error');
          }
        }, error => {
          this.loadingCreateGame = false;
          this.openDialog(JSON.stringify(error.error), 'Error');
        })
    }, 3000)
  }

  private async handleGameStep() {
    // console.log('gameStep: ' + this.generalService.gameStep)
    // console.log('waitForConditions: ' + this.generalService.finishedTimer)
    // console.log('waitForNextStepTrigger: ' + this.nextStepTriggered)
    // console.log('nextButtonDisable: ' + this.generalService?.nextButtonDisable)
    // this.generalService.finishedTimer = false;
    await this.waitForConditions().then(async () => {
      if (this.generalService.gameStep == 2) {
        if (!this.generalService?.nextButtonDisable) {
          await this.gameBoardComponent.sendAnswer();
          await this.waitForNextStepTrigger().then(async () => {
            this.generalService.nextButtonDisable = true;
            this.nextStepTriggered = false;
            await this.gameService.getAllAnswersOfSpecificQuestion(
              this.generalService.createdGameData.game.gameId,
              this.generalService.gameQuestion._id
            ).then(async data => {
              if (data.status === 1) {
                this.generalService.specificQuestionAnswers = data.data;
                this.generalService.gameStep = 3;
                this.generalService.finishedTimer = false;
                this.generalService.nextButtonDisable = false;
                this.countdownTimerComponent.startCountdown();
                this.gameBoardComponent.updateRates(this.generalService.rateAnswers.length != 0);
              }
            });
            this.handleGameStep();
          });
        } else {
          await this.waitForNextStepTrigger().then(async () => {
            this.nextStepTriggered = false;
            await this.gameService.getAllAnswersOfSpecificQuestion(
              this.generalService.createdGameData.game.gameId,
              this.generalService.gameQuestion._id
            ).then(async data => {
              if (data.status === 1) {
                this.generalService.specificQuestionAnswers = data.data;
                this.generalService.gameStep = 3;
                this.generalService.finishedTimer = false;
                this.generalService.nextButtonDisable = false;
                this.countdownTimerComponent.startCountdown();
                this.gameBoardComponent.updateRates(this.generalService.rateAnswers.length != 0);
              }
            });
            this.handleGameStep();
          });
        }
      } else if (this.generalService.gameStep == 3) {
        // console.log(333)
        if (!this.generalService?.nextButtonDisable) {
          await this.gameBoardComponent.sendRateAnswer();
          await this.waitForNextStepTrigger().then(async () => {
            this.generalService.nextButtonDisable = true;
            this.nextStepTriggered = false;
            await this.gameService.getGameQuestionBasedOnStep(
              this.generalService?.createdGameData?.game?.gameId,
              parseInt(this.generalService.gameQuestion.step) + 1
            ).then(async resQue => {
              if (resQue.status == 1) {
                this.generalService.gameQuestion = resQue?.data;
                if (resQue?.data?.myAnswer) {
                  this.generalService.gameAnswerGeneral = resQue?.data?.myAnswer;
                  this.generalService.editingAnswer = true;
                } else {
                  this.generalService.editingAnswer = false;
                }
                this.generalService.gameStep = 2;
                this.generalService.finishedTimer = false;
                this.generalService.nextButtonDisable = false;
                this.countdownTimerComponent.startCountdown();
              } else {
                this.generalService.gameStep = 4;
                this.generalService.nextButtonDisable = false;
                this.countdownTimerComponent.startCountdown();
                await this.gameService.getQuestionsOfGame(
                  this.generalService?.createdGameData?.game?.gameId)
                  .then(async resQue => {
                    this.generalService.allQuestions = resQue?.data;
                    this.generalService.finishedTimer = false;
                    this.generalService.nextButtonDisable = false;
                    this.gameBoardComponent.updateRatesQuestions(this.generalService.rateQuestions.length != 0);
                  });
              }
            });
            this.handleGameStep();
          });
        } else {
          await this.waitForNextStepTrigger().then(async () => {
            this.nextStepTriggered = false;
            await this.gameService.getGameQuestionBasedOnStep(
              this.generalService?.createdGameData?.game?.gameId,
              parseInt(this.generalService.gameQuestion.step) + 1
            ).then(async resQue => {
              if (resQue.status == 1) {
                this.generalService.gameQuestion = resQue?.data;
                if (resQue?.data?.myAnswer) {
                  this.generalService.gameAnswerGeneral = resQue?.data?.myAnswer;
                  this.generalService.editingAnswer = true;
                } else {
                  this.generalService.editingAnswer = false;
                }
                this.generalService.finishedTimer = false;
                this.generalService.gameStep = 2;
                this.generalService.nextButtonDisable = false;
                this.countdownTimerComponent.startCountdown();
              } else {
                this.generalService.gameStep = 4;
                this.generalService.nextButtonDisable = false;
                this.countdownTimerComponent.startCountdown();
                await this.gameService.getQuestionsOfGame(
                  this.generalService?.createdGameData?.game?.gameId)
                  .then(async resQue => {
                    this.generalService.allQuestions = resQue?.data;
                    this.generalService.finishedTimer = true;
                    this.generalService.nextButtonDisable = false;
                    this.gameBoardComponent.updateRatesQuestions(this.generalService.rateQuestions.length != 0);
                  });
              }
            });
            this.handleGameStep();
          });
        }
      } else if (this.generalService.gameStep == 4) {
        // console.log(444)
        if (!this.generalService?.nextButtonDisable) {
          await this.gameBoardComponent.sendRateQuestions();
          await this.waitForNextStepTrigger().then(async () => {
            this.nextStepTriggered = false;
            this.generalService.nextButtonDisable = true;
            this.handleGameStep();
          });
        } else {
          this.generalService.nextButtonDisable = false;
          // await this.waitForNextStepTrigger().then(async () => {
          //   this.handleGameStep();
          // });
        }
      }
    });
  }

  // Method to wait for the conditions to be true
  private waitForConditions(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.conditionsMet()) {
          clearInterval(interval);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  private waitForNextStepTrigger(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.conditionsTriggerMet()) {
          clearInterval(interval);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  private conditionsMet(): boolean {
    return this.generalService.finishedTimer;
  }

  private conditionsTriggerMet(): boolean {
    return this.nextStepTriggered;
  }

  openDialog(message: any, title: any) {
    this.dialog.open(DialogContentComponent, {data: {message: message, title: title}});
  }

  isSelectedGameType(item: any): boolean {
    return this.selectedGameType.some((game: any) => game === item);
  }

  selectGameType(item: any) {
    this.selectedGameType = [];
    this.selectedGameType.push(item);
  }

  isSelected(item: any): boolean {
    return this.selectedCategory.some((category: any) => category._id === item._id);
  }

  selectCat(item: any) {
    const index = this.selectedCategory.findIndex((data: any) => data._id === item._id);
    if (index !== -1) {
      // Remove the item from the array
      this.selectedCategory.splice(index, 1);
    } else {
      this.selectedCategory.push(item);
    }
  }

  onSubmitInvite() {
    const index = this.invitedArray.findIndex((data: any) => data === this.inviteForm.controls.email.value);
    if (index !== -1) {
      // Remove the item from the array
    } else {
      this.filteredEmails = [];
      this.invitedArray.push(this.inviteForm.controls.email.value);
      this.inviteForm.reset();
    }
  }

  removeInvite(item: any) {
    const index = this.invitedArray.findIndex((data: any) => data === item);
    if (index !== -1) {
      // Remove the item from the array
      this.invitedArray.splice(index, 1);
    }
  }

  updateWordCount() {
    this.wordCount = this.questionForm.controls.question.value ? (100 - this.questionForm.controls.question.value.trim().split(/\s+/).length) : 100;
  }

  updateWordCountAnswer() {
    this.wordCountAnswer = this.questionForm.controls.answer.value ? (100 - this.questionForm.controls.answer.value.trim().split(/\s+/).length) : 100;
  }

  joinToGame(code: any = this.gameCode) {
    // this.generalService.startingGame = true;
    // this.router.navigate(['/game-board']);
    this.generalService.socket = io('https://api.staging.1qma.games', {withCredentials: true});
    this.generalService.socket.on("connect", () => {
      console.log("connect");
    });
    this.generalService.socket.on("player added", (arg: any) => {
      console.log("emit", arg);
      this.generalService.players.push(arg);
    });
    this.generalService.socket.on("start game", (arg: any) => {
      console.log("emit game started", arg);
      this.timer = setTimeout(() => {
        this.gameService.getGameQuestionBasedOnStep(this.generalService?.createdGameData?.game?.gameId, 1).then(resQue => {
          this.generalService.gameQuestion = resQue?.data;
          this.generalService.gameStep = 2;
          this.generalService.finishedTimer = false;
          this.handleGameStep();
          if (resQue?.data?.myAnswer) {
            this.generalService.gameAnswerGeneral = resQue?.data?.myAnswer;
            this.generalService.editingAnswer = true;
          } else {
            this.generalService.editingAnswer = false;
          }
        });
      }, 100);
    });

    this.generalService.socket.on("next step", (arg: any) => {
      console.log("emit next step", arg);
      this.nextStepTriggered = true;
      // this.handleGameStep();
    });

    this.generalService.socket.on("end game", (arg: any) => {
      console.log("end game", arg);
      // this.waitForConditions().then(async () => {
      this.generalService.gameStep = 5;
      this.getGameResult();
      // });
    });

    this.generalService.socket.on("disconnected", function () {
      console.log('disconnected')
    });
    this.loadingJoinWithCode = true;
    this.gameService.joinToGame(code).then(data => {
      this.loadingJoinWithCode = false;
      if (data.status == 1) {
        const dialogRef = this.dialog.open(JoiningGame, {
          data: {data: data.data, gameCode: code},
          width: '700px'
        });
        dialogRef.afterClosed().subscribe(async result => {
          if (result == 'success') {
          }
        });
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    })
  }

  findFriendGame() {
    this.loadingFindFriend = true;
    this.gameService.findFriendGame(this.userEmail).then(data => {
      this.loadingFindFriend = false;
      if (data.status == 1) {
        this.findFriendGameData = data.data;
        this.findFriendStep = 2;
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    })
  }

  async getGameResult() {
    this.gameService.getGameResult(this.generalService.createdGameData.game.gameId).then(data => {
        this.generalService.gameResult = data.data;
      }
    )
  }

  async getResultOfSearch() {
    // Clear any existing timer
    clearTimeout(this.timer);

    // Set a new timer
    this.timer = setTimeout(() => {
      this.gameService.searchUserToInvite(this.inviteForm.controls.email.value).then(data => {
        this.filteredEmails = (data.data);
      })
    }, 3000);
  }

  openImportFromLib() {
    const dialogRef = this.dialog.open(ImportFromLibrary, {
      data: {category: this.selectedCategory, type: this.selectedGameType},
      width: '620px'
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
    });
  }
}

@Component({
  selector: 'joining-game',
  templateUrl: 'joining-game.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, SharedModule, TranslateModule],
})

export class JoiningGame {
  questionForm = this._formBuilder.group({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', [Validators.required]),
  });
  wordCount: number = 100;
  wordCountAnswer: number = 100;
  loading: boolean = false;

  constructor(private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<JoiningGame>, public configService: ConfigService,
              public dialog: MatDialog, private gameService: GamesService, private generalService: GeneralService,
              @Inject(MAT_DIALOG_DATA) public data: any, private router: Router) {
  }

  async closeModal() {
    this.dialogRef.close();
  }

  openImportFromLib() {
    const dialogRef = this.dialog.open(ImportFromLibrary, {
      data: {category: this.data.data.game.category, type: this.data.game.gameType._id},
      width: '620px'
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
    });
  }

  async joinGame() {
    this.loading = true;
    this.gameService.joinGameWithMyQuestion(this.data?.data?.game?._id, this.questionForm.controls.question.value, this.questionForm.controls.answer.value).then(async data => {
      this.loading = false;
      if (data.status == 1) {
        this.dialogRef.close();
        let account = await this.generalService.getItem('account');
        if (account) {
          // Update the "assets" property
          account.assets = data?.data?.newBalance;
          // Save the updated "account" object back to storage
          this.generalService.saveToStorage('account', JSON.stringify(account));
        }
        this.generalService.startingGame = true;
        this.generalService.createdGameData = data.data;
        this.router.navigate(['/game-board'], {state: {data: data.data, users: []}});
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    }, error => {
      this.loading = false;
      this.openDialog(JSON.stringify(error.error), 'Error');
    })
  }

  openDialog(message: any, title: any) {
    this.dialog.open(DialogContentComponent, {data: {message: message, title: title}});
  }
}

@Component({
  selector: 'import-from-library',
  templateUrl: 'import-from-library.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, SharedModule, TranslateModule],
})

export class ImportFromLibrary implements OnInit {
  search: any = '';
  selectedTabIndex: any = 0;

  constructor(private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<ImportFromLibrary>,
              private clientService: ClientService, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  async ngOnInit(): Promise<any> {
    this.clientService.getUserQuestions(this.data.category[0]._id, this.data.type, this.search).then(data => {

    })
  }


  async closeModal() {
    this.dialogRef.close();
  }
}
