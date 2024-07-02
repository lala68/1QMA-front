import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from "./material/material.module";
import {RouterModule} from "@angular/router";
import {SidenavComponent} from "./sidenav/sidenav.component";
import {AddQuestion, ExitGame, HeaderComponent} from "./header/header.component";
import {FooterComponent} from "./footer/footer.component";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    SidenavComponent, HeaderComponent, FooterComponent, AddQuestion, ExitGame
  ],
    imports: [
        CommonModule, MaterialModule, RouterModule,TranslateModule, FormsModule, ReactiveFormsModule
    ],
  exports: [
    MaterialModule, SidenavComponent, HeaderComponent, FooterComponent,
  ],
  providers: []
})
export class SharedModule { }
