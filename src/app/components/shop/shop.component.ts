import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NavigationStart, Router, RouterModule} from "@angular/router";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {ParsIntPipe} from "../../pipes/pars-int.pipe";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {GeneralService} from "../../services/general/general.service";
import {ShopService} from "../../services/shop.service";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Preferences} from "@capacitor/preferences";
import {IntroJsService} from "../../services/introJs/intro-js.service";
import introJs from "intro.js";

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    TranslateModule, DaysAgoPipe, ParsIntPipe],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  loading: boolean = false;
  features: any;
  assets: any;
  bundles: any;
  allData: any;
  page: any = 1;
  limit: any = 100;
  step: any = 1;
  shopType: any;
  detail: any;
  selected: any;
  private routerSubscription: any;
  private introInProgress: boolean = false; // Track whether the intro is showing

  constructor(public generalService: GeneralService, private processHTTPMsgService: ProcessHTTPMsgService, private router: Router,
              private shopService: ShopService, private _snackBar: MatSnackBar, private intro: IntroJsService,
              private translate: TranslateService) {
    this.generalService.currentRout = '/shop';
    this.generalService.selectedTabIndexParentInTrivia = 0;
    this.generalService.selectedTabIndexQuestionChildInTrivia = 0;
    this.generalService.selectedTabIndexGameChildInTrivia = 0;
  }

  async ngOnInit() {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && this.introInProgress) {
        this.destroyIntro(); // Destroy the intro if the page is changing
      }
    });
    await this.getShops();
    await this.waitForClientInit();
    // After clientInit is ready, check the value
    if (
      this.generalService.clientInit &&
      this.generalService.clientInit.user &&
      this.generalService.clientInit.user.hasSeenIntros &&
      !this.generalService.clientInit.user.hasSeenIntros.shop
    ) {
      await this.showIntro(); // Wait for showIntro to finish
    }
  }

  async waitForClientInit() {
    while (!this.generalService.clientInit?.user?.hasSeenIntros) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Check every 100ms
    }
  }

  ngOnDestroy() {
    introJs().exit(true);
  }

  destroyIntro() {
    if (this.introInProgress) {
      introJs().exit(true); // Assuming 'cancel()' is a method from the intro library to stop the intro
      this.introInProgress = false; // Reset the flag
    }
  }

  async showIntro() {
    if (this.router.url === '/shop') {
      const steps = [
        {
          element: '#features',
          intro: this.translate.instant('features-shop-section-intro'),
          position: 'bottom',
        }, {
          element: '#assets',
          intro: this.translate.instant('assets-shop-section-intro'),
          position: 'bottom',
        }, {
          element: '#bundles',
          intro: this.translate.instant('bundles-shop-section-intro'),
          position: 'bottom',
        }
      ];
      // Filter out steps where the element does not exist in the DOM
      const availableSteps = steps.filter(step =>
        document.querySelector(step.element) !== null
      );

      // Proceed with the intro only if there are valid steps
      if (availableSteps.length > 0) {
        await this.intro.showHelp('shop', availableSteps, 'triviaHub');
      }
    }
  }

  async getShops() {
    this.shopService.getShops('', this.page, 5).then(data => {
      data.data.filter((item: any, index: any) => {
        if (item.shopItemType == 'feature') {
          this.features = item.items;
        }
        if (item.shopItemType == 'asset') {
          this.assets = item.items;
        }

        if (item.shopItemType == 'bundle') {
          this.bundles = item.items;
        }
      });
    })
  }

  async showAll(type: any) {
    // console.log(type)
    this.step = 2;
    this.shopType = type === 'feature' ? 'Features' : type === 'asset' ? 'Assets' : 'Bundles';
    // console.log(this.shopType)
    this.shopService.getShops(type, this.page, this.limit).then(data => {
      this.allData = data.data;
    })
  }

  async gotoDetail(item: any) {
    this.step = 3;
    this.detail = item
  }

  async payWithCoin(id: any) {
    if (this.selected == 'coin') {
      this.shopService.payWithCoin(id).then(async data => {
        if (data.status == 1) {
          this.step = 4;
          let account = await this.generalService.getItem('account');
          if (account) {
            // Update the "assets" property
            account.assets.coins = data?.data?.newBalance;
            // Save the updated "account" object back to storage
            this.generalService.saveToStorage('account', JSON.stringify(account));
          }
          await Preferences.remove({key: 'account'});
          await Preferences.set({key: 'account', value: JSON.stringify(account)});
          await this.generalService.getUserData();
        } else {
          this.openDialog(data.message, 'Error');
        }
      })
    }
  }

  openDialog(message: any, title: any) {
    this._snackBar.openFromComponent(SnackbarContentComponent, {
      data: {
        title: title,
        message: message
      },
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: title == 'Success' ? 'app-notification-success' : 'app-notification-error'
    });
  }

  isSelected(type: any): boolean {
    return this.selected == type;
  }

  async select(item: any) {
    this.selected = item;
  }

}
