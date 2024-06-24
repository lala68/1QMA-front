// dialog-content.component.ts
import {Component, Inject, Input} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {SharedModule} from "../../shared/shared.module";

@Component({
  selector: 'app-dialog-content',
  templateUrl: './dialog-content.component.html',
  styleUrl: './dialog-content.component.scss',
  standalone: true,
  imports: [SharedModule]
})
export class DialogContentComponent {
  constructor(private dialogRef: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data)
  }

  close() {
    this.dialogRef.closeAll();
  }
}
