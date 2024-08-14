import {Component, OnInit} from '@angular/core';
import {TranslateModule} from "@ngx-translate/core";
import {ActivatedRoute, Params, Router, RouterModule} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {CommonModule} from "@angular/common";
import {ClientService} from "../../services/client/client.service";
import {ConfigService} from "../../services/config/config.service";
import {GeneralService} from "../../services/general/general.service";
import {ParsIntPipe} from "../../pipes/pars-int.pipe";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, TranslateModule, ParsIntPipe, DaysAgoPipe],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
  loading: boolean = true;
  id: any;
  user: any;
  latestGames: any;

  constructor(private clientService: ClientService, private router: Router, private processHTTPMsgService: ProcessHTTPMsgService,
              public configService: ConfigService, private generalService: GeneralService) {
    this.id = this.router.getCurrentNavigation()?.extras?.state?.['id'];
    this.generalService.currentRout = '';
  }

  async ngOnInit(): Promise<any> {
    this.clientService.getUserById(this.id).then(data => {
      this.loading = false;
      if (data.status == 1) {
        this.user = data.data.user;
        this.latestGames = data.data.latestGames;
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  async gotoResult(id: any) {
    await this.router.navigate(['game-result'], {state: {id: id}});
  }
}
