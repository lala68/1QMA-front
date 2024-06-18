import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {ClientService} from "../../services/client/client.service";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GeneralService} from "../../services/general/general.service";
import {RouterModule} from "@angular/router";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, NgxMatIntlTelInputComponent, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  constructor(private clientService: ClientService, private _formBuilder: FormBuilder, public generalService: GeneralService) {
  }

  async ngOnInit(): Promise<any> {
  }

}
