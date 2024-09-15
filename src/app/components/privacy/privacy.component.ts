import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "../../shared/shared.module";
import {GeneralService} from "../../services/general/general.service";
import {ClientService} from "../../services/client/client.service";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
  privacy: any;

  constructor(public generalService: GeneralService, private clientService: ClientService,
              private processHTTPMsgService: ProcessHTTPMsgService, private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.clientService.getPrivacy().then(data => {
      if (data.status == 1) {
        this.privacy = data;
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);

    });
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
