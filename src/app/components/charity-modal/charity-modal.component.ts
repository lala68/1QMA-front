import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {RouterModule} from "@angular/router";
import {ClientService} from "../../services/client/client.service";
import {GeneralService} from "../../services/general/general.service";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Preferences} from "@capacitor/preferences";
import {ConfigService} from "../../services/config/config.service";

@Component({
  selector: 'app-charity-modal',
  standalone: true,
  imports: [MaterialModule, CommonModule, TranslateModule, RouterModule],
  templateUrl: './charity-modal.component.html',
  styleUrl: './charity-modal.component.scss'
})
export class CharityModalComponent implements OnInit {
  selectedCharity: any

  constructor(public dialogRef: MatDialogRef<CharityModalComponent>, private clientService: ClientService,
              public generalService: GeneralService, private _snackBar: MatSnackBar, public configService: ConfigService) {
  }

  async ngOnInit() {
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  selectCharity(item: any) {
    this.selectedCharity = item;
  }

  selectActivity(item: any) {
    const obj = {
      "charity": this.selectedCharity?._id,
      "activity": item._id
    }
    this.clientService.postCharity(obj).then(async data => {
      if (data.status == 1) {
        this.openDialog(data.message, 'Success');
        this.generalService.clientInit.charityProgress = data.data.progress;
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data?.data?.user)});
        await this.generalService.getUserData();
        this.dialogRef.close(false);
      } else {
        this.openDialog(data.message, 'Error');
      }
    })
  }

  openDialog(message: any, title: any) {
    this._snackBar.openFromComponent(SnackbarContentComponent, {
      data: {
        title: title,
        message: message
      },
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: title == 'Success' ? 'app-notification-success' : 'app-notification-error'
    });
  }

}
