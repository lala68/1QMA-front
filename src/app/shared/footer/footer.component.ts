import { Component } from '@angular/core';
import {GeneralService} from "../../services/general/general.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {

  constructor(public generalService: GeneralService) {
  }

}
