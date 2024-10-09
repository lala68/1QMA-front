import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {GeneralService} from "../../services/general/general.service";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {ShopService} from "../../services/shop.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {GamesComponent} from "../games/games.component";

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    TranslateModule, DaysAgoPipe],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit {
  loading: boolean = false;
  data: any;

  constructor(public generalService: GeneralService, private processHTTPMsgService: ProcessHTTPMsgService,
              private shopService: ShopService, private _snackBar: MatSnackBar, private gameComponent: GamesComponent) {
    this.generalService.currentRout = '';
  }

  async ngOnInit(): Promise<any> {
    await this.getNotifications();
  }

  async getNotifications() {
    this.shopService.getNotifications(1, 30).then(data => {
      this.data = data.data;
    })
  }

  gotoGame(data: any) {
    this.gameComponent.joinToGame(data.data.gameId);
  }
}
