import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {DaysAgoPipe} from "../../days-ago.pipe";
import {GamesService} from "../../services/games/games.service";
import {ConfigService} from "../../services/config/config.service";
import {TimeDifferencePipe} from "../../time-difference.pipe";
import { Location } from '@angular/common';
import {ParsIntPipe} from "../../pars-int.pipe";

@Component({
  selector: 'app-game-result',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    TranslateModule, DaysAgoPipe, TimeDifferencePipe, ParsIntPipe],
  templateUrl: './game-result.component.html',
  styleUrl: './game-result.component.scss'
})
export class GameResultComponent implements OnInit {
  loading: boolean = true;
  gameResult: any;
  gameId: any;
  panelOpenState: boolean[] = [];


  constructor(private gameService: GamesService, public configService: ConfigService,
              private router: Router, private location: Location) {
    this.gameId = this.router.getCurrentNavigation()?.extras?.state?.['id'];
  }

  ngOnInit() {
    this.gameService.getGameResult(this.gameId).then(data => {
        this.loading = false;
        if (data.status == 1) {
          this.gameResult = data.data;
          console.log(this.gameResult)
        }
      }
    )
  }

  goBack(): void {
    this.location.back();
  }

}
