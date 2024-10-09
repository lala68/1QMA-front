import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";

@Component({
  selector: 'app-more',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './more.component.html',
  styleUrl: './more.component.scss'
})
export class MoreComponent {

  constructor(public generalService: GeneralService) {
  }

}
