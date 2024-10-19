import { Component } from '@angular/core';
import {GamesService} from "../../services/games/games.service";
import {ClientService} from "../../services/client/client.service";
import {GeneralService} from "../../services/general/general.service";
import {ConfigService} from "../../services/config/config.service";
import {IntroJsService} from "../../services/introJs/intro-js.service";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {CommonModule, Location} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {ParsIntPipe} from "../../pipes/pars-int.pipe";
import {NgbRatingModule} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, TranslateModule, DaysAgoPipe, ParsIntPipe,
    NgbRatingModule],
  templateUrl: './question-detail.component.html',
  styleUrl: './question-detail.component.scss',
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
export class QuestionDetailComponent {
  loading: boolean = false;
  questionDetail: any;
  performance: any;
  id: any;

  constructor(private gameService: GamesService, private clientService: ClientService, private route: ActivatedRoute,
              public generalService: GeneralService, public configService: ConfigService, private intro: IntroJsService,
              private router: Router, private processHTTPMsgService: ProcessHTTPMsgService, private location: Location) {
    this.route.queryParams.subscribe(params => {
      this.id = (params['id']);
    });
  }

  async ngOnInit(): Promise<any> {
    await this.getPerformance(this.id);
  }

  async getPerformance(id: any) {
    this.clientService.getQuestionPerformance(id).then(data => {
      this.performance = data.data;
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/frame.png';
  }

  async gotoResult(id: any) {
    // await this.router.navigate(['game-result'], {state: {id: id}});
    await this.router.navigate(['game-result'], {queryParams: {id: id}});
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

  goBack(): void {
    this.location.back();
  }
}
