import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {SharedModule} from "../../shared/shared.module";
import {ClientService} from "../../services/client/client.service";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {
  panelOpenState: boolean[] = [];
  faqs: any;

  constructor(public generalService: GeneralService, private clientService: ClientService,
              private processHTTPMsgService: ProcessHTTPMsgService, private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.clientService.getFaqs().then(data => {
      if (data.status == 1) {
        this.faqs = data.data;
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
