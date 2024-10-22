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
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {
  terms: any;

  constructor(public generalService: GeneralService, private clientService: ClientService,
              private processHTTPMsgService: ProcessHTTPMsgService, private _snackBar: MatSnackBar) {
    this.generalService.currentRout = '';
  }

  ngOnInit() {
    this.clientService.getTerms().then(data => {
      if (data.status == 1) {
        this.terms = data;
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
