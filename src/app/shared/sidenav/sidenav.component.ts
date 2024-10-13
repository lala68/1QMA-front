import {Component, OnInit, ViewChild} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import {ConfigService} from "../../services/config/config.service";
import {IntroJsService} from "../../services/introJs/intro-js.service";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {AddQuestion} from "../header/header.component";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  isFabOpen = false;

  constructor(private intro: IntroJsService, private observer: BreakpointObserver, public dialog: MatDialog,
              public generalService: GeneralService, public configService: ConfigService) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.ngAfterViewInit();
    }, 10000);
  }

  ngAfterViewInit() {
    this.observer.observe(["(max-width: 800px)"])
      .subscribe(result => {
        console.log(result)
        this.generalService.isMobileView = result.matches;
      });
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
    await this.intro.showHelp('dashboard', steps);
  }

  toggleFab() {
    this.isFabOpen = !this.isFabOpen;
  }

  // async openAddQuestion() {
  //   const dialogRef = this.dialog.open(AddQuestion, {
  //     width: '700px'
  //   });
  //   dialogRef.afterClosed().subscribe(async result => {
  //     if (result == 'success') {
  //     }
  //   });
  // }

  openAddQuestion(): void {
    const dialogConfig = new MatDialogConfig();
    // Check if it's mobile
    if (this.generalService.isMobileView) { // Assuming mobile devices are <= 768px
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.height = 'auto'; // You can specify the height if needed
      dialogConfig.position = { bottom: '0px' };
      dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
    } else {
      dialogConfig.width = '700px'; // Full size for desktop or larger screens
    }

    const dialogRef = this.dialog.open(AddQuestion, dialogConfig);
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
    });
  }
}
