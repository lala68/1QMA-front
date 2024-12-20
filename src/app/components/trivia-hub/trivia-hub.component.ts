import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";
import {NavigationStart, Router, RouterModule} from "@angular/router";
import {GamesService} from "../../services/games/games.service";
import {ClientService} from "../../services/client/client.service";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {ConfigService} from "../../services/config/config.service";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {ParsIntPipe} from "../../pipes/pars-int.pipe";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {NgbRatingModule} from "@ng-bootstrap/ng-bootstrap";
import {IntroJsService} from "../../services/introJs/intro-js.service";
import {MatTabGroup} from "@angular/material/tabs";
import introJs from "intro.js";

@Component({
  selector: 'app-trivia-hub',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, TranslateModule, DaysAgoPipe, ParsIntPipe,
    NgbRatingModule],
  templateUrl: './trivia-hub.component.html',
  styleUrl: './trivia-hub.component.scss',
  styles: `
			i {
				position: relative;
				display: inline-block;
				font-size: 1.5rem;
				padding-right: 0.1rem;
				color: #d3d3d3;
			}

			.filled {
				color: gold;
				overflow: hidden;
				position: absolute;
				top: 0;
				left: 0;
			}
		`,
})
export class TriviaHubComponent implements OnInit {
  loading: boolean = false;
  loadingContent: boolean = true;
  library: any = [];
  libraryQuestions: any = [];
  gameData: any = [];
  search: any = '';
  selectedCategory: any = '';
  questionStep: any = 1;
  loadingMore: boolean = false;
  page: any = 1;
  noMoreItems: any;
  rating = 3.14;
  selectedSortOption: string = 'newest';
  selectedSortOptionGame: string = 'newest';
  private routerSubscription: any;
  private introInProgress: boolean = false; // Track whether the intro is showing

  constructor(private gameService: GamesService, private clientService: ClientService,
              public generalService: GeneralService, public configService: ConfigService, private intro: IntroJsService,
              private router: Router, private processHTTPMsgService: ProcessHTTPMsgService, private translate: TranslateService) {
    this.generalService.currentRout = '/trivia-hub';
    // this.question = this.router.getCurrentNavigation()?.extras?.state?.['question'];
    // if (this.question) {
    //   this.questionStep = 2;
    //   this.questionDetail = this.question;
    //   this.getPerformance(this.question._id);
    // }
  }

  async ngOnInit() {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && this.introInProgress) {
        this.destroyIntro(); // Destroy the intro if the page is changing
      }
    });
    if ((!this.search || this.search.length > 2) && this.generalService.selectedTabIndexParentInTrivia == 0) {
      this.library = [];
      this.libraryQuestions = [];
      this.loadingContent = true;
      this.clientService.getUserQuestions(this.selectedCategory ? this.selectedCategory : '', this.generalService.selectedTabIndexQuestionChildInTrivia == 0
        ? 'trivia'
        : this.generalService.selectedTabIndexQuestionChildInTrivia == 1
          ? 'private'
          : 'bookmark', this.search, this.page, 4, this.selectedSortOption).then(async data => {
        this.loadingContent = false;
        this.library = (data.data);
        this.libraryQuestions = this.libraryQuestions.concat(data.data.questions);
        this.noMoreItems = data.data.questions?.length < 4;
        await this.waitForClientInit();
        // After clientInit is ready, check the value
        if (
          this.generalService.clientInit &&
          this.generalService.clientInit.user &&
          this.generalService.clientInit.user.hasSeenIntros &&
          !this.generalService.clientInit.user.hasSeenIntros.triviaHub
        ) {
          setTimeout(async () => {
            await this.showIntro(); // Wait for showIntro to finish
          }, 1000);
        }
      }, error => {
        return this.processHTTPMsgService.handleError(error);
      });
    } else if (this.generalService.selectedTabIndexParentInTrivia == 1) {
      this.changeGames();
    }
  }

  destroyIntro() {
    if (this.introInProgress) {
      introJs().exit(true); // Assuming 'cancel()' is a method from the intro library to stop the intro
      this.introInProgress = false; // Reset the flag
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

  async showIntro() {
    if (this.router.url === '/trivia-hub') {
      // Select all tab elements
      const tabElements = document.querySelectorAll('div[role="tab"]');

      // Check if there are enough tabs for the intro steps
      if (tabElements.length === 0) {
        console.warn('No tabs found for the intro.');
        return;
      }

      // Dynamically create steps for each tab element found
      const steps = Array.from(tabElements).map((tabElement, index) => ({
        element: tabElement,
        intro: this.translate.instant(`intro.step${index + 1}`),
        position: 'bottom'
      }));

      // Filter out steps where the element does not exist in the DOM
      const availableSteps = steps.filter(step =>
        document.contains(step.element)
      );

      // Proceed with the intro only if there are valid steps
      if (availableSteps.length > 0) {
        this.introInProgress = true;
        try {
          await this.intro.showHelp('triviaHub', availableSteps, 'triviaHub');
        } finally {
          this.introInProgress = false; // Reset flag after intro
        }
      } else {
        console.warn('No valid elements found for the intro steps.');
      }
    }
  }

  async changeQuestions() {
    if (!this.search || this.search.length > 2) {
      this.library = [];
      this.page = 1;
      this.libraryQuestions = [];
      this.loadingContent = true;
      this.clientService.getUserQuestions(this.selectedCategory[0] ? this.selectedCategory[0]._id : '', this.generalService.selectedTabIndexQuestionChildInTrivia == 0
        ? 'trivia'
        : this.generalService.selectedTabIndexQuestionChildInTrivia == 1
          ? 'private'
          : 'bookmark', this.search, this.page, 4, this.selectedSortOption).then(data => {
        this.loadingContent = false;
        this.library = (data.data);
        this.libraryQuestions = this.libraryQuestions.concat(data.data.questions);
        this.noMoreItems = data.data.questions?.length < 4;
      }, error => {
        return this.processHTTPMsgService.handleError(error);
      });
    }
  }

  questionOrGame() {
    this.page = 1;
    if (this.generalService.selectedTabIndexParentInTrivia == 0) {
      this.ngOnInit();
    } else if (this.generalService.selectedTabIndexParentInTrivia == 1) {
      this.changeGames();
    }
  }

  isSelected(item: any): boolean {
    return this.selectedCategory.some((category: any) => category._id === item._id);
  }

  async selectCat(id: any) {
    this.page = 1;
    this.selectedCategory = id;
    // this.selectedCategory.push(id);
    await this.ngOnInit();
  }

  async selectCatGame(id: any) {
    this.selectedCategory = id;
    // this.selectedCategory.push(id);
    await this.changeGames();
  }

  async changeGames() {
    this.loadingContent = true;
    this.gameService.getAllOrMyGames(this.generalService.selectedTabIndexGameChildInTrivia == 0 ? '' : 'private',
      this.selectedCategory ? this.selectedCategory : '', 10, 1, this.selectedSortOptionGame).then(data => {
      this.loadingContent = false;
      this.gameData = data.data;
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  async gotoAnswer(item: any) {
    this.questionStep = 2;
    await this.router.navigate(['question-detail'], {queryParams: {id: (item._id)}});
    // this.questionDetail = item;
    // await this.getPerformance(item._id)
  }

  async gotoResult(id: any) {
    // await this.router.navigate(['game-result'], {state: {id: id}});
    await this.router.navigate(['game-result'], {queryParams: {id: id}});
  }

  async showMore() {
    this.page++;
    this.loadingMore = true;
    this.clientService.getUserQuestions(this.selectedCategory[0] ? this.selectedCategory[0]._id : '', this.generalService.selectedTabIndexQuestionChildInTrivia == 0
      ? 'trivia'
      : this.generalService.selectedTabIndexQuestionChildInTrivia == 1
        ? 'private'
        : 'bookmark', this.search, this.page, 4, this.selectedSortOption).then(data => {
      this.loadingContent = false;
      this.loadingMore = false;
      this.library = (data.data);
      this.libraryQuestions = this.libraryQuestions.concat(data.data.questions);
      this.noMoreItems = data.data.questions?.length < 4;
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  async showMoreGames() {
    this.page++;
    this.loadingMore = true;
    this.gameService.getAllOrMyGames(this.generalService.selectedTabIndexGameChildInTrivia == 0 ? '' : 'private',
      this.selectedCategory ? this.selectedCategory : '', 10, this.page, this.selectedSortOptionGame).then(data => {
      this.loadingMore = false;
      this.gameData = this.gameData.concat(data.data);
      this.noMoreItems = data.data?.length < 10;
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  async addLike(item: any) {
    this.clientService.likeQuestion(item._id).then(data => {
      if (data.status == 1) {
        if (item.liked) {
          item.liked = !item.liked;
          item.likes--;
        } else {
          if (item.disliked) {
            item.disliked = !item.disliked;
            item.dislikes--;
          }
          item.liked = !item.liked;
          item.likes++;
        }
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  async disLike(item: any) {
    this.clientService.disLikeQuestion(item._id).then(data => {
      if (data.status == 1) {
        if (item.disliked) {
          item.disliked = !item.disliked;
          item.dislikes--;
        } else {
          if (item.liked) {
            item.liked = !item.liked;
            item.likes--;
          }
          item.disliked = !item.disliked;
          item.dislikes++;
        }
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  async addBookmark(item: any) {
    this.clientService.bookmarkQuestion(item._id).then(data => {
      if (data.status == 1) {
        item.bookmarked = !item.bookmarked;
      }
    })
  }

  async removeBookmark(item: any) {
    this.clientService.removeBookmarkQuestion(item._id).then(data => {
      if (data.status == 1) {
        item.bookmarked = !item.bookmarked;
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  onSelect(option: string): void {

    this.selectedSortOption = option;
    // console.log('Selected option:', this.selectedSortOption);
    this.changeQuestions();
    // You can also perform any additional logic here based on the selected option.
  }

  onSelectGameSort(option: string): void {
    this.selectedSortOptionGame = option;
    this.noMoreItems = false;
    this.page = 1;
    // console.log('Selected option:', this.selectedSortOption);
    this.changeGames();
    // You can also perform any additional logic here based on the selected option.
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/frame.png';
  }

}
