import { Component } from '@angular/core';
import {MaterialModule} from "../../shared/material/material.module";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {RouterModule} from "@angular/router";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [MaterialModule, CommonModule, TranslateModule, RouterModule],
  templateUrl: './notification-modal.component.html',
  styleUrl: './notification-modal.component.scss'
})
export class NotificationModalComponent {

  constructor(public generalService: GeneralService, public dialogRef: MatDialogRef<NotificationModalComponent>,) {
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

}
