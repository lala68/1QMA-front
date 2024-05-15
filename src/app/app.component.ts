import { Component } from '@angular/core';
import {Router} from "@angular/router";
import { register } from 'swiper/element/bundle';
import {TranslateService} from "@ngx-translate/core";

register();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'maGames';

  constructor(private router: Router, private translateService: TranslateService,) {
    this.router.navigate(['login']);
    this.translateService.setDefaultLang('en');
  }
}
