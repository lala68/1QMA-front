import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {io} from "socket.io-client";
import {GeneralService} from "../../services/general/general.service";
import {ClipboardModule} from "@angular/cdk/clipboard";

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, TranslateModule, ClipboardModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent implements OnInit {
  loading: boolean = false;
  data: any;
  users: any;

  constructor(private generalService: GeneralService, private router: Router,) {
    this.data = this.router.getCurrentNavigation()?.extras?.state?.['data'];
    this.users = this.router.getCurrentNavigation()?.extras?.state?.['users'];
  }

  async ngOnInit() {
    this.generalService.socket = io('https://api.staging.1qma.games', {withCredentials: true});
    this.generalService.socket.on("connect", () => {
      console.log("connect");
    });
    this.generalService.socket.on("player added", (arg: any) => {
      console.log("emit", arg);
    });
    this.generalService.socket.on("disconnected", function () {
      console.log('disconnected')
    });
  }
}
