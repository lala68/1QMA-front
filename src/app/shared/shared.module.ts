import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from "./material/material.module";
import {RouterModule} from "@angular/router";
import {SidenavComponent} from "./sidenav/sidenav.component";

@NgModule({
  declarations: [
    SidenavComponent
  ],
    imports: [
        CommonModule, MaterialModule, RouterModule
    ],
  exports: [
    MaterialModule, SidenavComponent
  ],
  providers: []
})
export class SharedModule { }
