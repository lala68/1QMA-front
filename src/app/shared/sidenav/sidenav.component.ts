import {Component, OnInit, ViewChild} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import {ConfigService} from "../../services/config/config.service";


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {


  constructor(public generalService: GeneralService, public configService: ConfigService) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.ngAfterViewInit();
    }, 10000)
  }


  ngAfterViewInit() {
    // this.observer.observe(["(max-width: 800px)"]).subscribe((res) => {
    //   setTimeout(() => {
    //     if (res.matches) {
    //       this.sidenav.mode = "over";
    //       this.sidenav.close();
    //     } else {
    //       this.sidenav.mode = "side";
    //       this.sidenav.open();
    //     }
    //   }, 4000);
    // });
  }

  async closeNavMenu() {
    // if (this.sidenav.mode === "over") {
    //   this.sidenav.close();
    // }
  }
}
