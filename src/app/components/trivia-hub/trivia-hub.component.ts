import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {GamesService} from "../../services/games/games.service";
import {ClientService} from "../../services/client/client.service";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {ConfigService} from "../../services/config/config.service";

@Component({
  selector: 'app-trivia-hub',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './trivia-hub.component.html',
  styleUrl: './trivia-hub.component.scss'
})
export class TriviaHubComponent implements OnInit {
  loading: boolean = false;
  loadingContent: boolean = true;
  selectedTabIndex: any = 0;
  library: any = [];
  search: any = '';

  constructor(private gameService: GamesService, private clientService: ClientService,
              public generalService: GeneralService, public configService: ConfigService) {
  }

  async ngOnInit(): Promise<any> {
    if (!this.search || this.search.length > 2) {
      this.library = [];
      this.loadingContent = true;
      this.clientService.getUserQuestions('', this.selectedTabIndex == 0
        ? 'private'
        : this.selectedTabIndex == 1
          ? 'public'
          : 'bookmarked', this.search).then(data => {
        this.loadingContent = false;
        this.library = data.data;
      });
    }
  }

}
