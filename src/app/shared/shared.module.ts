import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from "./material/material.module";
import {RouterModule} from "@angular/router";
import {SidenavComponent} from "./sidenav/sidenav.component";
import {HeaderComponent} from "./header/header.component";
import {FooterComponent} from "./footer/footer.component";

@NgModule({
  declarations: [
    SidenavComponent, HeaderComponent, FooterComponent
  ],
    imports: [
        CommonModule, MaterialModule, RouterModule
    ],
  exports: [
    MaterialModule, SidenavComponent, HeaderComponent, FooterComponent
  ],
  providers: []
})
export class SharedModule { }
