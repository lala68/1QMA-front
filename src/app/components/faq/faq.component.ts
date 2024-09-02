import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {SharedModule} from "../../shared/shared.module";

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  panelOpenState: boolean[] = [];


  constructor(public generalService: GeneralService) {
  }

}
