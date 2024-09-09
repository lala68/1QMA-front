import { Component } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {RouterModule} from "@angular/router";

@Component({
  selector: 'app-charity-modal',
  standalone: true,
  imports: [MaterialModule, CommonModule, TranslateModule, RouterModule],
  templateUrl: './charity-modal.component.html',
  styleUrl: './charity-modal.component.scss'
})
export class CharityModalComponent {

  constructor(public dialogRef: MatDialogRef<CharityModalComponent>,) {
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

}
