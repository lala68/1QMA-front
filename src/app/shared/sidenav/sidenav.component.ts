import {Component, OnInit, ViewChild} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import {ConfigService} from "../../services/config/config.service";
import {IntroJsService} from "../../services/introJs/intro-js.service";


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {


  constructor(private intro: IntroJsService, public generalService: GeneralService, public configService: ConfigService) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.ngAfterViewInit();
    }, 10000);

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

  async showIntro() {
    const steps = [
      {
        element: '#userAccount',
        intro: ('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et orci eu quam convallis tincidunt quis nec magna.'),
        position: 'bottom',
      }, {
        element: '#dashboard',
        intro: ('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et orci eu quam convallis tincidunt quis nec magna.'),
        position: 'bottom',
      }, {
        element: '#games',
        intro: ('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et orci eu quam convallis tincidunt quis nec magna.'),
        position: 'bottom',
      }, {
        element: '#trivia',
        intro: ('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et orci eu quam convallis tincidunt quis nec magna.'),
        position: 'bottom',
      }, {
        element: '#shop',
        intro: ('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et orci eu quam convallis tincidunt quis nec magna.'),
        position: 'bottom',
      }
    ];
    await this.intro.showHelp('app-side', steps);
  }
}
