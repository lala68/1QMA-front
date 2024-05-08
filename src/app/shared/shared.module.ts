import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from "./material/material.module";
import { SidenavComponent } from './sidenav/sidenav.component';
import {RouterModule} from "@angular/router";

@NgModule({
  declarations: [
    SidenavComponent
  ],
    imports: [
        CommonModule, MaterialModule, RouterModule
    ],
  exports: [
    SidenavComponent
  ]
})
export class SharedModule { }
