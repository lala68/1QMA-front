import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {routes} from "./routes";
import {RouterModule} from "@angular/router";



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', onSameUrlNavigation: 'reload', useHash: true})
  ]
})
export class AppRoutingModule { }
