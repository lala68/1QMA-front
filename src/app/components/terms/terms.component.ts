import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "../../shared/shared.module";
import {GeneralService} from "../../services/general/general.service";

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {

  constructor(public generalService: GeneralService) {
  }

}
