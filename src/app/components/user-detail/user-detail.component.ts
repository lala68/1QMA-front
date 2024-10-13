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
  idStack: number[] = []; // Array to store the stack of IDs
  currentId: number | null = null; // Current ID displayed

  constructor(private clientService: ClientService, private router: Router, private processHTTPMsgService: ProcessHTTPMsgService,
              public configService: ConfigService, public generalService: GeneralService, private route: ActivatedRoute) {
    // this.id = this.router.getCurrentNavigation()?.extras?.state?.['id'];
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
    });
    this.generalService.currentRout = '';
    this.idStack.push(this.id);
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
    // await this.router.navigate(['game-result'], {state: {id: id}});
    await this.router.navigate(['game-result'],{ queryParams: { id: id } });
  }

  async gotoUserDetail(id: any) {

  }

  // Method to push a new ID into the stack and load the page
  pushId(newId: number): void {
    this.idStack.push(newId);
    this.currentId = newId;
    this.loadPageWithId(newId);
  }

  // Method to pop the last ID and go back to the previous one
  popId(): void {
    if (this.idStack.length > 1) {
      this.idStack.pop(); // Remove the last ID
      const previousId = this.idStack[this.idStack.length - 1]; // Get the new last ID
      this.currentId = previousId;
      this.loadPageWithId(previousId);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Simulated method to "load" a page with a given ID
  loadPageWithId(id: number): void {
    // Simulate loading a page with the given ID (can be a router navigation)
    this.clientService.getUserById(id).then(data => {
      this.loading = false;
      if (data.status == 1) {
        this.user = data.data.user;
        this.latestGames = data.data.latestGames;
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }


  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/frame.png';
  }

}
