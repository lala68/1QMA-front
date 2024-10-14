import {Component, Inject} from '@angular/core';
import {MaterialModule} from "../../shared/material/material.module";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {RouterModule} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {GamesComponent} from "../games/games.component";

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [MaterialModule, CommonModule, TranslateModule, RouterModule],
  templateUrl: './notification-modal.component.html',
  styleUrl: './notification-modal.component.scss'
})
export class NotificationModalComponent {

  constructor(public generalService: GeneralService, public dialogRef: MatDialogRef<NotificationModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private gameComponent: GamesComponent) {
    // alert(JSON.stringify(data))
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  gotoGame() {
    this.gameComponent.joinToGame(this.data.data.gameId);
    this.cancel();
  }

}
