import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from "./material/material.module";
import {RouterModule} from "@angular/router";
import {MoreMobile, SidenavComponent} from "./sidenav/sidenav.component";
import {
  AccountMobile,
  AddQuestion,
  ExitGame,
  GiftMobile,
  HeaderComponent,
  NotificationMobile
} from "./header/header.component";
import {FooterComponent} from "./footer/footer.component";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ShamsiDatePipe} from "../pipes/shamsi-date.pipe";

@NgModule({
    declarations: [
        SidenavComponent, HeaderComponent, FooterComponent, AddQuestion, ExitGame, AccountMobile, GiftMobile, MoreMobile
    ],
  imports: [
    CommonModule, MaterialModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule,

  ],
  exports: [
    MaterialModule, SidenavComponent, HeaderComponent, FooterComponent, RouterModule
  ],
  providers: [ShamsiDatePipe]
})
export class SharedModule {
}
