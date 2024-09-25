import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {TranslateModule} from "@ngx-translate/core";
import {RouterModule} from "@angular/router";
import {GeneralService} from "../../services/general/general.service";

@Component({
  selector: 'app-gift-history',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    TranslateModule, DaysAgoPipe],
  templateUrl: './gift-history.component.html',
  styleUrl: './gift-history.component.scss'
})
export class GiftHistoryComponent {
  loading: boolean = false;

  constructor(public generalService: GeneralService) {
  }
}
