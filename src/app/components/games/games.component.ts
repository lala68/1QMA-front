import {
  Component,
  HostListener,
  Inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {ActivatedRoute, NavigationStart, Router, RouterModule} from "@angular/router";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {GamesService} from "../../services/games/games.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {ConfigService} from "../../services/config/config.service";
import {ClientService} from "../../services/client/client.service";
import {io} from "socket.io-client";
import {GameBoardComponent} from "../game-board/game-board.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {ParsIntPipe} from "../../pipes/pars-int.pipe";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import translate from "translate";
import {IntroJsService} from "../../services/introJs/intro-js.service";
import introJs from "intro.js";
import {TwoDecimalPipe} from "../../pipes/two-decimal.pipe";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    TranslateModule, DaysAgoPipe, ParsIntPipe, TwoDecimalPipe],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss',
  providers: [GameBoardComponent, CountdownTimerComponent],
  encapsulation: ViewEncapsulation.None,
})
export class GamesComponent implements OnInit {
  loading: boolean = true;
  createGameStep: any = 1;
  selectedGameMode: any;
  selectedGameType: any = [];
  selectedCategory: any = '';
  selectedCategoryLive: any = '';
  inviteForm = this._formBuilder.group({
    email: new FormControl(
      {
        value: '',
        disabled:
          this.generalService.invitedPlayersArray?.length ===
          this.generalService.gameInit?.numberOfPlayers,
      },
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]
    ),
  });
  wordCount: number;
  wordCountAnswer: number;
  questionForm = this._formBuilder.group({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', [Validators.required]),
  });
  gameCode: any;
  userEmail: any;
  filteredEmails: any = [];
  findFriendStep: any = 1;
  findFriendGameData: any;
  selectedTabIndex: string = 'overview';
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
  questionId: any;
  maxAnswersRatesLength: any = 0;
  longestAnswerRateIndex: any = 0;
  private routerSubscription: any;
  private introInProgress: boolean = false; // Track whether the intro is showing

  constructor(public generalService: GeneralService, private gameService: GamesService, public configService: ConfigService,
              private _formBuilder: FormBuilder, private router: Router, public dialog: MatDialog, private _snackBar: MatSnackBar,
              private route: ActivatedRoute, private intro: IntroJsService, private gameBoardComponent: GameBoardComponent,
              private processHTTPMsgService: ProcessHTTPMsgService, private translate: TranslateService) {
    this.generalService.currentRout = '/games/overview';
    this.generalService.selectedTabIndexParentInTrivia = 0;
    this.generalService.selectedTabIndexQuestionChildInTrivia = 0;
    this.generalService.selectedTabIndexGameChildInTrivia = 0;
    this.generalService.invitedPlayersArray = [];
    this.generalService.players = [];
    this.generalService.toggleValueTranslate = this.generalService.userObj?.enableAutoTranslate;
    this.generalService.selectedTranslatedLanguage = this.generalService.userObj?.targetLanguage;
    this.wordCount = this.generalService.gameInit?.answerWordsLimitation;
    this.wordCountAnswer = this.generalService.gameInit?.answerWordsLimitation;
  }

  async ngOnInit() {
    // Subscribe to router events to detect page changes
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && this.introInProgress) {
        this.destroyIntro(); // Destroy the intro if the page is changing
      }
    });

    this.wordCountAnswer = this.generalService.gameInit?.answerWordsLimitation;
    this.route.paramMap.subscribe((params) => {
      // console.log(params.get('id'));
      this.selectedTabIndex = params.get('id') || '';
    });

    try {
      // Use Promise.all to ensure all async data fetching is complete before marking loading as false
      const [
        scoreboardData,
        liveGamesData,
        friendsGamesData,
        scoreboardSurvivalData,
        liveSurvivalData,
        friendsRecentSurvivalData,
      ] = await Promise.all([
        this.gameService.getMyScoreboard(),
        this.gameService.getLiveGames(),
        this.gameService.getFriendsRecentGames(),
        this.gameService.getScoreboardSurvival(),
        this.gameService.getLiveSurvival(),
        this.gameService.getFriendsRecentSurvival(),
      ]);

      // Handle scoreboard data
      if (scoreboardData.status === 1) {
        this.myScoreboard = scoreboardData.data;
        this.myScoreboard.forEach((item: any, index: any) => {
          const answersRatesLength = item.result.answersRates.length;
          if (answersRatesLength > this.maxAnswersRatesLength) {
            this.maxAnswersRatesLength = answersRatesLength;
            this.longestAnswerRateIndex = index;
          }
        });
      }

      // Assign other data
      if (liveGamesData.status === 1) this.liveGames = liveGamesData.data;
      if (friendsGamesData.status === 1)
        this.friendsGames = friendsGamesData.data;
      if (scoreboardSurvivalData.status === 1)
        this.scoreboardSurvival = scoreboardSurvivalData.data;
      if (liveSurvivalData.status === 1)
        this.liveSurvival = liveSurvivalData.data;
      if (friendsRecentSurvivalData.status === 1)
        this.friendsRecentSurvival = friendsRecentSurvivalData.data;
    } catch (error) {
      // Handle errors
      await this.processHTTPMsgService.handleError(error);
    } finally {
      // Set loading to false after all async calls are resolved
      this.loading = false;

      // Wait for client initialization and check DOM elements before showing intro
      await this.waitForClientInit();

      // Define intro steps
      const steps = this.getIntroSteps();

      // Wait for elements to be available in the DOM
      const availableSteps = await this.waitForElements(steps);

      // Show intro if conditions are met
      if (
        this.generalService.clientInit &&
        this.generalService.clientInit.user &&
        this.generalService.clientInit.user.hasSeenIntros &&
        !this.generalService.clientInit.user.hasSeenIntros.games &&
        availableSteps.length > 0
      ) {
        await this.showIntro(); // Wait for showIntro to finish
      } else {
        console.warn(
          'Intro not shown: conditions not met or no available steps.'
        );
      }
    }
  }

  async waitForClientInit() {
    while (!this.generalService.clientInit?.user?.hasSeenIntros) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Check every 100ms
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  async showIntro() {
    if (this.router.url === '/games/overview') {
      const steps = [
        {
          element: '#scoreboard',
          intro: this.translate.instant('scoreboard-games-section-intro'),
          position: 'bottom',
        },
        {
          element: '#live',
          intro: this.translate.instant('live-games-section-intro'),
          position: 'bottom',
        },
        {
          element: '#friendsRecent',
          intro: this.translate.instant('friends-recent-games-section-intro'),
          position: 'bottom',
        },
        {
          element: '#survival',
          intro: this.translate.instant('survival-games-section-intro'),
          position: 'bottom',
        },
        {
          element: '#liveSurvival',
          intro: this.translate.instant('live-survival-games-section-intro'),
          position: 'bottom',
        },
        {
          element: '#friendsSurvival',
          intro: this.translate.instant('friends-survival-games-section-intro'),
          position: 'bottom',
        },
      ];

      const availableSteps = this.getAvailableSteps(steps);

      // console.log(availableSteps);

      // Proceed with the intro only if there are valid steps
      if (availableSteps.length > 0) {
        try {
          await this.intro.showHelp('games', availableSteps, 'games');
        } catch (error) {
          console.error('Error showing intro:', error);
          // Handle the error appropriately, e.g., show an alert to the user
        }
      } else {
        console.warn('No available steps for the intro.');
        // Optionally, you could notify the user that no intro will be shown
      }
    }
  }

  getIntroSteps() {
    return [
      {
        element: '#scoreboard',
        intro: this.translate.instant('scoreboard-games-section-intro'),
        position: 'bottom',
      },
      {
        element: '#live',
        intro: this.translate.instant('live-games-section-intro'),
        position: 'bottom',
      },
      {
        element: '#friendsRecent',
        intro: this.translate.instant('friends-recent-games-section-intro'),
        position: 'bottom',
      },
      {
        element: '#survival',
        intro: this.translate.instant('survival-games-section-intro'),
        position: 'bottom',
      },
      {
        element: '#liveSurvival',
        intro: this.translate.instant('live-survival-games-section-intro'),
        position: 'bottom',
      },
      {
        element: '#friendsSurvival',
        intro: this.translate.instant('friends-survival-games-section-intro'),
        position: 'bottom',
      },
    ];
  }

  getAvailableSteps(steps: any[]): any[] {
    // Filter out steps where the element does not exist in the DOM
    return steps.filter(
      (step) => document.querySelector(step.element) !== null
    );
  }

  // Additional function to check for elements after a delay
  async waitForElements(
    steps: any[],
    maxAttempts: number = 5,
    interval: number = 500
  ): Promise<any[]> {
    let attempts = 0;
    let availableSteps = this.getAvailableSteps(steps);

    while (availableSteps.length === 0 && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, interval));
      availableSteps = this.getAvailableSteps(steps);
      attempts++;
    }

    return availableSteps;
  }

  // Method to destroy or cancel the intro
  destroyIntro() {
    if (this.introInProgress) {
      introJs().exit(true); // Assuming 'cancel()' is a method from the intro library to stop the intro
      this.introInProgress = false; // Reset the flag
    }
  }

  async gotoStepTwo(index: any) {
    this.selectedGameMode = index;
    if (this.selectedGameMode == 0 || this.selectedGameMode == 2) {
      await this.chooseRandomCategory();
    }
    this.createGameStep = 2;
  }

  resetData() {
    this.selectedCategory = '';
    this.selectedGameMode = '';
    this.selectedGameType = [];
    this.createGameStep = 1;
    this.findFriendStep = 1;
    this.questionForm.reset();
  }

  async chooseRandomCategory() {
    const randomIndex = Math.floor(
      Math.random() * this.generalService.clientInit.categories.length
    );
    const randomItem = this.generalService.clientInit.categories[randomIndex];
    this.selectedCategory = randomItem;
  }

  async startingGame() {
    this.loadingCreateGame = true;
    this.generalService.players = [];

    this.generalService.socket.on("start game", (arg: any) => {
      this.generalService.isDisconnectedModal = false;

      // if (this.generalService.disconnectedModal || this.generalService.isDisconnectedModal) {
      //   this.generalService.disconnectedModal.close();
      //   this.generalService.disconnectedModal = '';
      //   this.generalService.isDisconnectedModal = false;
      // }
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      // console.log("start game" + ' ' + `[${timeString}]  `);
      this.generalService.gameStep = 2;
      if (this.generalService.waitingModal) {
        this.generalService.waitingModal.close();
        this.generalService.waitingModal = '';
      }
      this.gameBoardComponent.handleGameStep();
      // console.log(this.generalService.selectedTranslatedLanguage)
      this.gameService.getGameQuestionBasedOnStep(this.generalService?.createdGameData?.game?.gameId, 1).then(async resQue => {
        this.generalService.gameQuestion = resQue?.data;
        if (this.generalService.toggleValueTranslate && this.generalService.selectedTranslatedLanguage != '') {
          // console.log(resQue?.data.question)
          // console.log(this.generalService.selectedTranslatedLanguage)
          this.generalService.gameQuestion.question = await this.detectAndTranslate(resQue?.data.question,
            this.generalService.selectedTranslatedLanguage, resQue?.data.language);
        }
        this.updateWordCountAnswerGame();
        if (resQue?.data?.myAnswer) {
          this.generalService.gameAnswerGeneral = resQue?.data?.myAnswer;
          this.generalService.editingAnswer = true;
        } else {
          this.generalService.editingAnswer = false;
        }
      }, error => {
        return this.processHTTPMsgService.handleError(error);
      });
    });

    setTimeout(() => {
      console.log(this.generalService.toggleValueTranslate)
      console.log(this.generalService.selectedTranslatedLanguage)
      this.gameService.createGame(this.selectedGameType[0], this.selectedGameMode.toString(), this.selectedCategory,
        this.generalService.invitedPlayersArray, this.questionForm.controls.question.value, this.questionForm.controls.answer.value, this.questionId)
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
                users: this.generalService.players
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
        message: message,
      },
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass:
        title == 'Success'
          ? 'app-notification-success'
          : 'app-notification-error',
    });
  }

  isSelectedGameType(item: any): boolean {
    return this.selectedGameType.some((game: any) => game === item);
  }

  async detectAndTranslate(question: string, targetLanguage: string, detectedLanguage: any): Promise<string> {
    // Use franc to detect the primary language
    if (question) {
      // const detectedLangISO6393: string = franc(question);
      // console.log(`Primary detected language (ISO 639-3): ${detectedLangISO6393}`);

      // Map the detected language to the ISO 639-1 code or default to English
      // let detectedLangISO6391 = this.supportedLangs[detectedLangISO6393 as SupportedLanguages] || 'en';

      // console.log(`ISO 639-1 code used for translation: ${detectedLangISO6391}`);
      // console.log(`Target language for translation: ${targetLanguage}`);

      // Perform the translation
      if (detectedLanguage !== targetLanguage) {
        try {
          const translatedText = await translate(question, {
            from: detectedLanguage,
            to: targetLanguage,
          });
          return translatedText;
        } catch (error) {
          console.error('Translation error:', error);
          throw new Error('Translation failed.');
        }
      } else {
        return question;
      }
    } else {
      return '';
    }
  }

  selectGameType(item: any) {
    this.selectedGameType = [];
    this.selectedGameType.push(item);
  }

  isSelected(item: any): boolean {
    return this.selectedCategory.some(
      (category: any) => category._id === item._id
    );
  }

  selectCat(id: any) {
    this.selectedCategory = '';
    // this.selectedCategory.push(id);
    this.selectedCategory = id;
  }

  isSelectedLive(item: any): boolean {
    return this.selectedCategoryLive.some(
      (category: any) => category._id === item._id
    );
  }

  async selectCatLive(id: any) {
    this.page = 1;
    this.selectedCategoryLive = id;
    // this.selectedCategoryLive.push(id);
    await this.getLives();
  }

  isSelectedLiveSurvival(item: any): boolean {
    return this.selectedCategory.some(
      (category: any) => category._id === item._id
    );
  }

  async selectCatLiveSurvival(id: any) {
    this.page = 1;
    this.selectedCategory = id;
    // this.selectedCategory.push(id);
    await this.getLiveSurvival();
  }

  async getLiveSurvival() {
    this.gameService
      .getLiveSurvival(this.selectedCategory ? this.selectedCategory : '')
      .then(
        (data) => {
          if (data.status == 1) this.liveSurvival = data.data;
        },
        (error) => {
          return this.processHTTPMsgService.handleError(error);
        }
      );
  }

  async getLives() {
    this.gameService
      .getLiveGames(this.selectedCategoryLive ? this.selectedCategoryLive : '')
      .then(
        (data) => {
          if (data.status == 1) this.liveGames = data.data;
        },
        (error) => {
          return this.processHTTPMsgService.handleError(error);
        }
      );
  }

  onSubmitInvite() {
    const index = this.generalService.invitedPlayersArray.findIndex(
      (data: any) => data === this.inviteForm.controls.email.value
    );
    if (index !== -1) {
      // Remove the item from the array
    } else {
      if (
        this.inviteForm.controls.email.value !=
        this.generalService.userObj?.email
      ) {
        this.filteredEmails = [];
        this.generalService.invitedPlayersArray.push(
          this.inviteForm.controls.email.value
        );
        this.inviteForm.reset();
        if (
          this.generalService.invitedPlayersArray?.length ==
          this.generalService.gameInit?.numberOfPlayers
        ) {
          this.inviteForm.controls.email.disable();
        }
      }
    }
    // console.log(this.generalService.invitedPlayersArray)
  }

  removeInvite(item: any) {
    this.inviteForm.controls.email.enable();
    const index = this.generalService.invitedPlayersArray.findIndex(
      (data: any) => data === item
    );
    if (index !== -1) {
      // Remove the item from the array
      this.generalService.invitedPlayersArray.splice(index, 1);
    }
  }

  updateWordCount() {
    this.wordCount = this.questionForm.controls.question.value
      ? this.generalService.gameInit.answerWordsLimitation -
        this.questionForm.controls.question.value.trim().split(/\s+/).length
      : this.generalService.gameInit.answerWordsLimitation;
  }

  updateWordCountAnswer() {
    this.wordCountAnswer = this.questionForm.controls.answer.value
      ? this.generalService.gameInit?.answerWordsLimitation -
        this.questionForm.controls.answer.value.trim().split(/\s+/).length
      : this.generalService.gameInit?.answerWordsLimitation;
    this.generalService.wordCountAnswer = this.questionForm.controls.answer
      .value
      ? this.generalService.gameInit?.answerWordsLimitation -
        this.questionForm.controls.answer.value.trim().split(/\s+/).length
      : this.generalService.gameInit?.answerWordsLimitation;
  }

  updateWordCountAnswerGame() {
    this.generalService.wordCountAnswer = this.questionForm.controls.answer
      .value
      ? this.generalService.gameInit?.answerWordsLimitation -
        this.questionForm.controls.answer.value.trim().split(/\s+/).length
      : this.generalService.gameInit?.answerWordsLimitation;
  }

  onToggleActiveTranslate(event: any) {
    this.generalService.toggleValueTranslate = !!event.checked;
    // this.generalService.userObj.enableAutoTranslate = true;
    if (!this.generalService.toggleValueTranslate) {
      this.generalService.selectedTranslatedLanguage = '';
      // this.generalService.userObj.enableAutoTranslate = false;
    } else {
      this.generalService.selectedTranslatedLanguage = this.generalService.selectedTranslatedLanguage ? this.generalService.selectedTranslatedLanguage : this.generalService.userObj.targetLanguage ? this.generalService.userObj.targetLanguage : 'en'
    }
  }

  selectTranslatedLang(id: any) {
    this.generalService.selectedTranslatedLanguage = id;
  }

  joinToGame(code: any = this.gameCode) {
    this.generalService.socket = io(environment.baseUrl, {withCredentials: true});
    this.generalService.socket.on("player added", async (arg: any) => {
      this.generalService.isDisconnectedModal = false;

      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      // console.log("player added" + ' ' + `[${timeString}]  `);
      // console.log(this.generalService.players);
      // if (this.generalService.disconnectedModal || this.generalService.isDisconnectedModal) {
      //   this.generalService.disconnectedModal.close();
      //   this.generalService.disconnectedModal = '';
      //   this.generalService.isDisconnectedModal = false;
      // }
      // if (!this.generalService.players.some((player: any) => player.email === arg.email)) {
      //   this.generalService.players.push(arg);
      // }
      if (
        !this.generalService.players.some(
          (player: any) => player.email === arg.email
        ) &&
        !this.generalService.invitedPlayersArray.some(
          (player: any) => player.email === arg.email
        )
      ) {
        this.generalService.players.push(arg);
      }

      await this.gameBoardComponent.removeFromInvited(arg.email);
    });

    this.generalService.socket.on("start game", (arg: any) => {
      this.generalService.isDisconnectedModal = false;
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
      // console.log("start game" + ' ' + `[${timeString}]  `);
      // if (this.generalService.disconnectedModal || this.generalService.isDisconnectedModal) {
      //   this.generalService.disconnectedModal.close();
      //   this.generalService.disconnectedModal = '';
      //   this.generalService.isDisconnectedModal = false;
      // }
      this.generalService.gameStep = 2;
      setTimeout(() => {
        // console.log(this.generalService?.createdGameData)
        this.gameService.getGameQuestionBasedOnStep(this.generalService?.createdGameData?.game?.gameId, 1).then(async resQue => {
          this.generalService.gameQuestion = resQue?.data;
          if (this.generalService.toggleValueTranslate && this.generalService.selectedTranslatedLanguage != '') {
            this.generalService.gameQuestion.question = await this.detectAndTranslate(resQue?.data.question,
              this.generalService.selectedTranslatedLanguage, resQue?.data.language);
          }
          this.updateWordCountAnswerGame();
          if (resQue?.data?.myAnswer) {
            this.generalService.gameAnswerGeneral = resQue?.data?.myAnswer;
            this.generalService.editingAnswer = true;
          } else {
            this.generalService.editingAnswer = false;
          }
        }, error => {
          return this.processHTTPMsgService.handleError(error);
        });
      }, 500)
      this.gameBoardComponent.handleGameStep()
    });

    this.loadingJoinWithCode = true;
    this.gameService.joinToGame(code).then(
      (data) => {
        this.loadingJoinWithCode = false;
        if (data.status == 1) {
          const dialogConfig = new MatDialogConfig();
          // Check if it's mobile
          if (this.generalService.isMobileView) {
            // Assuming mobile devices are <= 768px
            dialogConfig.width = '100vw';
            dialogConfig.maxWidth = '100vw';
            dialogConfig.height = 'auto'; // You can specify the height if needed
            dialogConfig.position = { bottom: '0px' };
            dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
            dialogConfig.data = { data: data.data, gameCode: code };
          } else {
            dialogConfig.data = { data: data.data, gameCode: code };
            dialogConfig.width = '700px'; // Full size for desktop or larger screens
          }
          const dialogRef = this.dialog.open(JoiningGame, dialogConfig);
          dialogRef.afterClosed().subscribe(async (result) => {
            if (result == 'success') {
            }
          });
        } else {
          this.openDialog(JSON.stringify(data.message), 'Error');
        }
      },
      (error) => {
        return this.processHTTPMsgService.handleError(error);
      }
    );
  }

  // Function to get the current tab index based on the selectedTabIndex value
  getSelectedTabIndex(): number {
    return this.selectedTabIndex === 'overview'
      ? 0
      : this.selectedTabIndex === 'create-game'
      ? 1
      : 2;
  }

  // Function to handle changes in the tab index
  onTabIndexChange(index: number): void {
    if (index === 0) {
      this.selectedTabIndex = 'overview';
    } else if (index === 1) {
      this.selectedTabIndex = 'create-game';
    } else {
      this.selectedTabIndex = 'find-game';
    }
  }

  findFriendGame() {
    this.loadingFindFriend = true;
    this.gameService.findFriendGame(this.userEmail, 10, this.page).then(
      (data) => {
        this.loadingFindFriend = false;
        if (data.status == 1) {
          this.findFriendGameData = data.data;
          this.findFriendStep = 2;
        } else {
          this.openDialog(JSON.stringify(data.message), 'Error');
        }
      },
      (error) => {
        return this.processHTTPMsgService.handleError(error);
      }
    );
  }

  showMoreGames() {
    this.loadingMore = true;
    this.gameService.findFriendGame(this.userEmail, 10, this.page + 1).then(
      (data) => {
        this.loadingMore = false;
        this.page++;
        if (data.status == 1) {
          // this.findFriendGameData?.endedGames.concat(data.data?.endedGames);
          this.findFriendGameData.endedGames = [
            ...this.findFriendGameData.endedGames,
            ...data.data.endedGames,
          ];
          this.noMoreItems = data.data.endedGames?.length < 10;

          // console.log(this.findFriendGameData?.endedGames)
        } else {
          this.openDialog(JSON.stringify(data.message), 'Error');
        }
      },
      (error) => {
        return this.processHTTPMsgService.handleError(error);
      }
    );
  }

  async getResultOfSearch() {
    if (
      this.inviteForm.controls?.email?.value &&
      this.inviteForm.controls?.email?.value?.length > 2
    ) {
      this.gameService
        .searchUserToInvite(this.inviteForm.controls.email.value)
        .then(
          (data) => {
            this.filteredEmails = data.data;
          },
          (error) => {
            return this.processHTTPMsgService.handleError(error);
          }
        );
    }
  }

  openImportFromLib() {
    const dialogConfig = new MatDialogConfig();
    // Check if it's mobile
    if (this.generalService.isMobileView) {
      // Assuming mobile devices are <= 768px
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.height = 'auto'; // You can specify the height if needed
      dialogConfig.position = { bottom: '0px' };
      dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
      dialogConfig.data = {
        category: this.selectedCategory?._id
          ? this.selectedCategory?._id
          : this.selectedCategory,
        type: this.selectedGameType,
      };
    } else {
      dialogConfig.data = {
        category: this.selectedCategory?._id
          ? this.selectedCategory?._id
          : this.selectedCategory,
        type: this.selectedGameType,
      };
      dialogConfig.width = '700px'; // Full size for desktop or larger screens
    }
    const dialogRef = this.dialog.open(ImportFromLibrary, dialogConfig);
    dialogRef.afterClosed().subscribe(async (result) => {
      // console.log(result)
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

  async gotoResult(id: any) {
    // await this.router.navigate(['game-result'], {state: {id: id}});
    await this.router.navigate(['game-result'], { queryParams: { id: id } });
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/frame.png';
  }
}

@Component({
  selector: 'joining-game',
  templateUrl: 'joining-game.html',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule,
  ],
})
export class JoiningGame {
  questionForm = this._formBuilder.group({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', [Validators.required]),
  });
  wordCount: number;
  wordCountAnswer: number;
  loading: boolean = false;
  questionId: any;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<JoiningGame>,
    public configService: ConfigService,
    public dialog: MatDialog,
    private gameService: GamesService,
    public generalService: GeneralService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    this.wordCount = this.generalService.gameInit.answerWordsLimitation;
    this.wordCountAnswer = this.generalService.gameInit.answerWordsLimitation;
  }

  async closeModal() {
    this.dialogRef.close();
  }

  openImportFromLib() {
    // console.log(this.data);
    const dialogConfig = new MatDialogConfig();
    // Check if it's mobile
    if (this.generalService.isMobileView) {
      // Assuming mobile devices are <= 768px
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.height = 'auto'; // You can specify the height if needed
      dialogConfig.position = { bottom: '0px' };
      dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
      dialogConfig.data = {
        category: [this.data?.data?.game?.category?._id],
        type: this.data.data.game.gameType.id,
      };
    } else {
      dialogConfig.data = {
        category: [this.data?.data?.game?.category?._id],
        type: this.data.data.game.gameType.id,
      };
      dialogConfig.width = '700px'; // Full size for desktop or larger screens
    }
    const dialogRef = this.dialog.open(ImportFromLibrary, dialogConfig);
    dialogRef.afterClosed().subscribe(async (result) => {
      // console.log(result)
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
    console.log(this.generalService.toggleValueTranslate)
    console.log(this.generalService.selectedTranslatedLanguage)
    this.loading = true;
    this.gameService
      .joinGameWithMyQuestion(
        this.data?.data?.game?._id,
        this.questionForm.controls.question.value,
        this.questionForm.controls.answer.value,
        this.questionId
      )
      .then(
        async (data) => {
          this.loading = false;
          if (data.status == 1) {
            this.dialogRef.close();
            let account = await this.generalService.getItem('account');
            if (account) {
              // Update the "assets" property
              account.assets = data?.data?.newBalance;
              // Save the updated "account" object back to storage
              this.generalService.saveToStorage(
                'account',
                JSON.stringify(account)
              );
            }
            this.generalService.startingGame = true;
            this.generalService.createdGameData = data.data;
            await this.router.navigate(['/game-board'], {
              state: { data: data.data, users: [] },
            });
          } else {
            this.openDialog(JSON.stringify(data.message), 'Error');
          }
        },
        (error) => {
          this.loading = false;
          this.openDialog(JSON.stringify(error.error), 'Error');
        }
      );
  }

  updateWordCount() {
    this.wordCount = this.questionForm.controls.question.value
      ? this.generalService.gameInit.answerWordsLimitation -
        this.questionForm.controls.question.value.trim().split(/\s+/).length
      : this.generalService.gameInit.answerWordsLimitation;
  }

  updateWordCountAnswer() {
    this.wordCountAnswer = this.questionForm.controls.answer.value
      ? this.generalService.gameInit?.answerWordsLimitation -
        this.questionForm.controls.answer.value.trim().split(/\s+/).length
      : this.generalService.gameInit?.answerWordsLimitation;
  }

  onToggleActiveTranslate(event: any) {
    this.generalService.toggleValueTranslate = !!event.checked;
    // this.generalService.userObj.enableAutoTranslate = true;
    if (!this.generalService.toggleValueTranslate) {
      this.generalService.selectedTranslatedLanguage = '';
      // this.generalService.userObj.enableAutoTranslate = false;
    } else {
      this.generalService.selectedTranslatedLanguage = this.generalService.selectedTranslatedLanguage ? this.generalService.selectedTranslatedLanguage : this.generalService.userObj.targetLanguage ? this.generalService.userObj.targetLanguage : 'en'
    }
  }

  selectTranslatedLang(id: any) {
    this.generalService.selectedTranslatedLanguage = id;
  }

  openDialog(message: any, title: any) {
    this._snackBar.openFromComponent(SnackbarContentComponent, {
      data: {
        title: title,
        message: message,
      },
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass:
        title == 'Success'
          ? 'app-notification-success'
          : 'app-notification-error',
    });
  }
}

@Component({
  selector: 'import-from-library',
  templateUrl: 'import-from-library.html',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule,
    DaysAgoPipe,
  ],
})
export class ImportFromLibrary implements OnInit {
  search: any = '';
  selectedTabIndex: any = 0;
  library: any = [];
  loading: boolean = true;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ImportFromLibrary>,
    private clientService: ClientService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public configService: ConfigService,
    public generalService: GeneralService,
    private processHTTPMsgService: ProcessHTTPMsgService,
    private gameService: GamesService
  ) {}

  async ngOnInit(): Promise<any> {
    if (!this.search || this.search.length > 2) {
      this.library = [];
      this.loading = true;
      this.clientService
        .getUserQuestions(
          this.data.category,
          this.selectedTabIndex == 0
            ? 'private'
            : this.selectedTabIndex == 1
            ? 'public'
            : 'bookmark',
          this.search
        )
        .then(
          (data) => {
            this.loading = false;
            this.library = data.data;
          },
          (error) => {
            return this.processHTTPMsgService.handleError(error);
          }
        );
    }

    this.gameService.gameInit().then(
      (data) => {
        if (data.status == 1) {
          this.generalService.gameInit = data.data;
        }
      },
      (error) => {
        return this.processHTTPMsgService.handleError(error);
      }
    );
  }

  async closeModal() {
    this.dialogRef.close();
  }

  async importQuestionAnswer(question: any, answer: any, id: any) {
    this.dialogRef.close({
      data: { question: question, answer: answer, id: id },
    });
  }

  async importQuestion(question: any, id: any) {
    this.dialogRef.close({ data: { question: question, id: id } });
  }
}
