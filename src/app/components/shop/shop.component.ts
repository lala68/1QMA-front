import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {DaysAgoPipe} from "../../pipes/days-ago.pipe";
import {ParsIntPipe} from "../../pipes/pars-int.pipe";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {GeneralService} from "../../services/general/general.service";
import {ShopService} from "../../services/shop.service";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {MatSnackBar} from "@angular/material/snack-bar";

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

  constructor(public generalService: GeneralService, private processHTTPMsgService: ProcessHTTPMsgService,
              private shopService: ShopService, private _snackBar: MatSnackBar) {
    this.generalService.currentRout = '/shop';
  }

  async ngOnInit(): Promise<any> {
    await this.getShops();
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
    this.step = 2;
    this.shopType = type == 'feature' ? 'features' : 'asset' ? 'assets' : 'bundles';
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
      this.shopService.payWithCoin(id).then(data => {
        if (data.status == 1) {
          this.step = 4;
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
