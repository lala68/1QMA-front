import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {GamesService} from "../../services/games/games.service";
import {ClientService} from "../../services/client/client.service";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {ConfigService} from "../../services/config/config.service";
import {DaysAgoPipe} from "../../days-ago.pipe";
import {ParsIntPipe} from "../../pars-int.pipe";

@Component({
  selector: 'app-trivia-hub',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, TranslateModule, DaysAgoPipe, ParsIntPipe],
  templateUrl: './trivia-hub.component.html',
  styleUrl: './trivia-hub.component.scss'
})
export class TriviaHubComponent implements OnInit {
  loading: boolean = false;
  loadingContent: boolean = true;
  selectedTabIndex: any = 0;
  selectedTabGameIndex: any = 0;
  selectedTabIndexParent: any = 0;
  library: any = [];
  gameData: any = [];
  search: any = '';
  selectedCategory: any = [''];
  questionStep: any = 1;
  questionDetail: any;

  constructor(private gameService: GamesService, private clientService: ClientService,
              public generalService: GeneralService, public configService: ConfigService,
              private router: Router) {
    this.generalService.currentRout = '/trivia-hub';
  }

  async ngOnInit(): Promise<any> {
    if (!this.search || this.search.length > 2) {
      this.library = [];
      this.loadingContent = true;
      this.clientService.getUserQuestions(this.selectedCategory[0] ? this.selectedCategory[0]._id : '', this.selectedTabIndex == 0
        ? 'private'
        : this.selectedTabIndex == 1
          ? 'public'
          : 'bookmark', this.search).then(data => {
        this.loadingContent = false;
        this.library = data.data;
      });
    }
  }

  questionOrGame() {
    if (this.selectedTabIndexParent == 0) {
      this.ngOnInit();
    } else if (this.selectedTabIndexParent == 1) {
      this.changeGames();
    }
  }

  isSelected(item: any): boolean {
    return this.selectedCategory.some((category: any) => category._id === item._id);
  }

  async selectCat(item: any) {
    this.selectedCategory = [];
    this.selectedCategory.push(item);
    await this.ngOnInit();
  }

  async selectCatGame(item: any) {
    this.selectedCategory = [];
    this.selectedCategory.push(item);
    await this.changeGames();
  }

  async changeGames() {
    this.loadingContent = true;
    this.gameService.getAllOrMyGames(this.selectedTabGameIndex == 0 ? '' : 'private',
      this.selectedCategory[0] ? this.selectedCategory[0]._id : '', 10, 1).then(data => {
      this.loadingContent = false;
      this.gameData = data.data;
    })
  }

  async gotoAnswer(item: any) {
    this.questionStep = 2;
    this.questionDetail = item;
  }

  async gotoResult(id: any) {
    await this.router.navigate(['game-result'], {state: {id: id}});
  }

}
