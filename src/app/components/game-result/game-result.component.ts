import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {GamesService} from "../../services/games/games.service";
import {ConfigService} from "../../services/config/config.service";
import {TimeDifferencePipe} from "../../pipes/time-difference.pipe";
import {Location} from '@angular/common';
import {ParsIntPipe} from "../../pipes/pars-int.pipe";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {GeneralService} from "../../services/general/general.service";
import {ShamsiDatePipe} from "../../pipes/shamsi-date.pipe";
import {TwoDecimalPipe} from "../../pipes/two-decimal.pipe";

@Component({
  selector: 'app-game-result',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    TranslateModule, DaysAgoPipe, TimeDifferencePipe, ParsIntPipe, ShamsiDatePipe, TwoDecimalPipe],
  templateUrl: './game-result.component.html',
  styleUrl: './game-result.component.scss',
  providers: [TwoDecimalPipe]
})
export class GameResultComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  gameResult: any;
  gameId: any;
  panelOpenState: boolean[] = [];
  translations: { [key: string]: string } = {};

  constructor(private gameService: GamesService, public configService: ConfigService, public generalService: GeneralService,
              private router: Router, private location: Location, private processHTTPMsgService: ProcessHTTPMsgService,
              private route: ActivatedRoute) {
    // this.gameId = this.router.getCurrentNavigation()?.extras?.state?.['id'];
    this.route.queryParams.subscribe(params => {
      this.gameId = params['id'];
    });
  }

  async ngOnInit() {
    this.gameService.getGameResult(this.gameId).then(async data => {
      this.loading = false;
      if (data.status == 1) {
        this.gameResult = data.data;
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    // Clear Google Translate settings when leaving the page
    // this.generalService.clearGoogleTranslateSettings();
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/frame.png';
  }

}
