import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {ExitGame} from "../../shared/header/header.component";

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openExitDialog(): Promise<boolean> {
    const dialogRef = this.dialog.open(ExitGame, {
      width: '500px'
    });

    return dialogRef.afterClosed().toPromise();
  }
}
