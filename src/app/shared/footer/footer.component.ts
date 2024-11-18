import {Component} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import jalaliMoment from "jalali-moment";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  currentGregorianYear: any;
  
  constructor(public generalService: GeneralService) {
    this.currentGregorianYear = generalService.userObj?.preferedLanguage?.code != 'fa' ? new Date().getFullYear() : jalaliMoment().locale('fa').format('jYYYY');
  }

  gotoSponsorLink(link: any) {
    window.open(link, '_blank');
  }

}
