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
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {ConfigService} from "../../services/config/config.service";
import {ClientService} from "../../services/client/client.service";
import {io} from "socket.io-client";
import {GameBoardComponent} from "../game-board/game-board.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";
import {DaysAgoPipe} from "../../days-ago.pipe";

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    TranslateModule, DaysAgoPipe],
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
  wordCount: number = 100;
  wordCountAnswer: number = 100;
  questionForm = this._formBuilder.group({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', [Validators.required]),
  });
  gameCode: any;
  userEmail: any;
  filteredEmails: any = [];
  findFriendStep: any = 1;
  findFriendGameData: any;
  selectedTabIndex: any = 0;
  loadingJoinWithCode: boolean = false;
  loadingFindFriend: boolean = false;
  loadingCreateGame: boolean = false;
  nextStepTriggered: boolean = false;
  loadingMore: boolean = false;
  page: any = 1;
  noMoreItems: any;
  myScoreboard: any;
  liveGames: any;
  friendsGames: any;
  scoreboardSurvival: any;
  friendsRecentSurvival: any;
  liveSurvival: any;

  constructor(public generalService: GeneralService, private gameService: GamesService, public configService: ConfigService,
              private _formBuilder: FormBuilder, private router: Router, public dialog: MatDialog, private _snackBar: MatSnackBar,
              private route: ActivatedRoute, private gameBoardComponent: GameBoardComponent) {
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

    this.gameService.getMyScoreboard().then(data => {
      this.myScoreboard = data;
    })

    this.gameService.getLiveGames().then(data => {
      if (data.status == 1)
        this.liveGames = data.data;
    })

    this.gameService.getFriendsRecentGames().then(data => {
      if (data.status == 1)
        this.friendsGames = data.data;
    })

    this.gameService.getScoreboardSurvival().then(data => {
      if (data.status == 1)
        this.scoreboardSurvival = data.data;
    })

    this.gameService.getLiveSurvival().then(data => {
      if (data.status == 1)
        this.liveSurvival = data.data;
    })

    this.gameService.getFriendsRecentSurvival().then(data => {
      if (data.status == 1)
        this.friendsRecentSurvival = data.data;
    })
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

    this.generalService.socket.on("start game", (arg: any) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("start game" + ' ' + `[${timeString}]  `);
      this.generalService.gameStep = 2;
      this.gameBoardComponent.handleGameStep();
      console.log(this.generalService?.createdGameData);
      this.gameService.getGameQuestionBasedOnStep(this.generalService?.createdGameData?.game?.gameId, 1).then(resQue => {
        this.generalService.gameQuestion = resQue?.data;
        if (resQue?.data?.myAnswer) {
          this.generalService.gameAnswerGeneral = resQue?.data?.myAnswer;
          this.generalService.editingAnswer = true;
        } else {
          this.generalService.editingAnswer = false;
        }
      })
    });

    setTimeout(() => {
      this.gameService.createGame(this.selectedGameType[0], this.selectedGameMode.toString(), this.selectedCategory,
        this.generalService.invitedPlayersArray, this.questionForm.controls.question.value, this.questionForm.controls.answer.value)
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
            await this.router.navigate(['/game-board'], {
              state: {
                data: data.data,
                users: this.generalService.invitedPlayersArray
              }
            });
          } else {
            this.loadingCreateGame = false;
            this.openDialog(JSON.stringify(data.message), 'Error');
          }
        }, error => {
          this.loadingCreateGame = false;
          this.openDialog(JSON.stringify(error.error), 'Error');
        })
    }, 100)
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
    this.selectedCategory = [];
    this.selectedCategory.push(item);
  }

  onSubmitInvite() {
    const index = this.generalService.invitedPlayersArray.findIndex((data: any) => data === this.inviteForm.controls.email.value);
    if (index !== -1) {
      // Remove the item from the array
    } else {
      this.filteredEmails = [];
      this.generalService.invitedPlayersArray.push(this.inviteForm.controls.email.value);
      this.inviteForm.reset();
    }
    console.log(this.generalService.invitedPlayersArray)
  }

  removeInvite(item: any) {
    const index = this.generalService.invitedPlayersArray.findIndex((data: any) => data === item);
    if (index !== -1) {
      // Remove the item from the array
      this.generalService.invitedPlayersArray.splice(index, 1);
    }
  }

  updateWordCount() {
    this.wordCount = this.questionForm.controls.question.value ? (100 - this.questionForm.controls.question.value.trim().split(/\s+/).length) : 100;
  }

  updateWordCountAnswer() {
    this.wordCountAnswer = this.questionForm.controls.answer.value ? (100 - this.questionForm.controls.answer.value.trim().split(/\s+/).length) : 100;
  }

  joinToGame(code: any = this.gameCode) {
    this.generalService.socket = io('https://api.staging.1qma.games', {withCredentials: true});
    this.generalService.socket.on("player added", (arg: any) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("player added" + ' ' + `[${timeString}]  `);
      this.generalService.players.push(arg);
    });

    this.generalService.socket.on("start game", (arg: any) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      console.log("start game" + ' ' + `[${timeString}]  `);
      this.generalService.gameStep = 2;
      setTimeout(() => {
        console.log(this.generalService?.createdGameData)
        this.gameService.getGameQuestionBasedOnStep(this.generalService?.createdGameData?.game?.gameId, 1).then(resQue => {
          this.generalService.gameQuestion = resQue?.data;
          if (resQue?.data?.myAnswer) {
            this.generalService.gameAnswerGeneral = resQue?.data?.myAnswer;
            this.generalService.editingAnswer = true;
          } else {
            this.generalService.editingAnswer = false;
          }
        })
      }, 500)
      this.gameBoardComponent.handleGameStep()
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
    this.gameService.findFriendGame(this.userEmail, 10, this.page).then(data => {
      this.loadingFindFriend = false;
      if (data.status == 1) {
        this.findFriendGameData = data.data;
        this.findFriendStep = 2;
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    })
  }

  showMoreGames() {
    this.loadingMore = true;
    this.gameService.findFriendGame(this.userEmail, 10, this.page + 1).then(data => {
      this.loadingMore = false;
      this.page++;
      if (data.status == 1) {
        // this.findFriendGameData?.endedGames.concat(data.data?.endedGames);
        this.findFriendGameData.endedGames = [...this.findFriendGameData.endedGames, ...data.data.endedGames];
        this.noMoreItems = data.data.endedGames?.length < 10;

        console.log(this.findFriendGameData?.endedGames)
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    })
  }

  async getResultOfSearch() {
    if (this.inviteForm.controls?.email?.value && this.inviteForm.controls?.email?.value?.length > 2) {
      this.gameService.searchUserToInvite(this.inviteForm.controls.email.value).then(data => {
        this.filteredEmails = (data.data);
      })
    }
  }

  openImportFromLib() {
    const dialogRef = this.dialog.open(ImportFromLibrary, {
      data: {category: this.selectedCategory, type: this.selectedGameType},
      width: '620px'
    });
    dialogRef.afterClosed().subscribe(async result => {
      console.log(result)
      if (result) {
        if (result.data?.question) {
          this.questionForm.controls.question.setValue(result.data?.question);
        }
        if (result.data?.answer) {
          this.questionForm.controls.answer.setValue(result.data?.answer);
        }
      }
    });
  }

  async gotoResult(id: any) {
    await this.router.navigate(['game-result'], {state: {id: id}});
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
              @Inject(MAT_DIALOG_DATA) public data: any, private router: Router, private _snackBar: MatSnackBar) {
  }

  async closeModal() {
    this.dialogRef.close();
  }

  openImportFromLib() {
    console.log(this.data)
    const dialogRef = this.dialog.open(ImportFromLibrary, {
      data: {category: [this.data?.data?.game?.category], type: this.data.data.game.gameType.id},
      width: '620px'
    });
    dialogRef.afterClosed().subscribe(async result => {
      console.log(result)
      if (result) {
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
        await this.router.navigate(['/game-board'], {state: {data: data.data, users: []}});
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
    this.wordCountAnswer = this.questionForm.controls.answer.value ? (100 - this.questionForm.controls.answer.value.trim().split(/\s+/).length) : 100;
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
  selector: 'import-from-library',
  templateUrl: 'import-from-library.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, SharedModule, TranslateModule],
})

export class ImportFromLibrary implements OnInit {
  search: any = '';
  selectedTabIndex: any = 0;
  library: any = [];
  loading: boolean = true;

  constructor(private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<ImportFromLibrary>,
              private clientService: ClientService, @Inject(MAT_DIALOG_DATA) public data: any,
              public configService: ConfigService, public generalService: GeneralService) {
  }

  async ngOnInit(): Promise<any> {
    console.log(this.data)
    if (!this.search || this.search.length > 2) {
      this.library = [];
      this.loading = true;
      this.clientService.getUserQuestions(this.data.category[0]._id, this.selectedTabIndex == 0
        ? 'private'
        : this.selectedTabIndex == 1
          ? 'public'
          : 'bookmarked', this.search).then(data => {
        this.loading = false;
        this.library = data.data;
      });
    }
  }


  async closeModal() {
    this.dialogRef.close();
  }

  async importQuestionAnswer(question: any, answer: any) {
    this.dialogRef.close({data: {question: question, answer: answer}})
  }

  async importQuestion(question: any) {
    this.dialogRef.close({data: {question: question}})
  }
}
