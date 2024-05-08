import {Component, OnInit, ViewChild} from '@angular/core';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {


  constructor() {
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
