import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {GeneralService} from "../../services/general/general.service";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ClientService} from "../../services/client/client.service";
import {ShamsiDatePipe} from "../../pipes/shamsi-date.pipe";

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    TranslateModule, DaysAgoPipe, ShamsiDatePipe],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  loading: boolean = false;
  data: any;

  constructor(public generalService: GeneralService, private processHTTPMsgService: ProcessHTTPMsgService,
              private clientService: ClientService, private _snackBar: MatSnackBar) {
    this.generalService.currentRout = '';
  }

  async ngOnInit(): Promise<any> {
    await this.getTransactions();
  }

  async getTransactions() {
    this.clientService.getTransactions(30, 1).then(data => {
      this.data = data.data;
    })
  }
}
