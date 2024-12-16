import {Component} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import jalaliMoment from "jalali-moment";
import {ConfigService} from "../../services/config/config.service";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  currentGregorianYear: any;
  environment = environment;

  constructor(public generalService: GeneralService, public configService: ConfigService) {
    this.currentGregorianYear = generalService.userObj?.preferedLanguage?.code != 'fa' ? new Date().getFullYear() : jalaliMoment().locale('fa').format('jYYYY');
  }

  gotoSponsorLink(link: any) {
    window.open(link, '_blank');
  }

}
