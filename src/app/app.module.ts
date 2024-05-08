import {NgModule, isDevMode} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing/app-routing.module';
import {AppComponent} from './app.component';
import {NgbAlertModule} from "@ng-bootstrap/ng-bootstrap";
import {MaterialModule} from "./shared/material/material.module";
import {SharedModule} from "./shared/shared.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {GetCategoryNamePipe} from './pipes/get-category-name.pipe';
import {LoaderInterceptor} from "./services/interceptors/loader.interceptor";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {CardListComponent} from "./components/card/card-list/card-list.component";
import { WorkspaceCardsComponent } from './components/workspace/workspace-cards/workspace-cards.component';
import { ViewComponent } from './components/workspace/workspace-cards/view/view.component';
import { ChargeComponent } from './components/wallet/charge/charge.component';
import {RouterModule} from "@angular/router";
import { InvoicesComponent } from './components/wallet/invoices/invoices.component';
import { OrdersComponent } from './components/workspace/orders/orders.component';
import { PublicCardListComponent } from './components/card/public-card-list/public-card-list.component';
import {MemberListComponent} from "./components/workspace/member/member-list/member-list.component";
import { InvoiceDetailComponent } from './components/wallet/invoices/invoice-detail/invoice-detail.component';
import { MomberListOrderComponent } from './components/workspace/orders/momber-list-order/momber-list-order.component';
import { HomeComponent } from './components/home/home.component';
import { SearchPipe } from './pipes/search.pipe';
import {GetWorkspaceNamePipe} from "./pipes/get-workspace-name.pipe";
import { TempComponent } from './components/temp/temp.component';
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import { ParseIntPipe } from './pipes/parse-int.pipe';
import { ParseIntContentPipe } from './pipes/parse-int-content.pipe';
import {ClipboardModule} from "@angular/cdk/clipboard";
import { PlansComponent } from './components/plans/plans.component';
import {NgPipesModule} from "ngx-pipes";
import { ErrorSubscriotionDialogComponent } from './components/error-subscriotion-dialog/error-subscriotion-dialog.component';
import {AccountInfoComponent} from "./components/account-info/account-info.component";
import { GetPlanNamePipe } from './pipes/get-plan-name.pipe';
import { GetParamNamePipe } from './pipes/get-param-name.pipe';
// import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
    GetCategoryNamePipe,
    CardListComponent,
    WorkspaceCardsComponent,
    ViewComponent,
    ChargeComponent,
    InvoicesComponent,
    OrdersComponent,
    AccountInfoComponent,
    PublicCardListComponent,
    MemberListComponent,
    InvoiceDetailComponent,
    MomberListOrderComponent,
    HomeComponent,
    GetWorkspaceNamePipe,
    TempComponent,
    ParseIntPipe,
    ParseIntContentPipe,
    PlansComponent,
    ErrorSubscriotionDialogComponent,
    GetPlanNamePipe,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    NgbAlertModule,
    SharedModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule,
    InfiniteScrollModule,
    ClipboardModule,
    NgPipesModule,
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      // registrationStrategy: 'registerWhenStable:30000'
    // }),
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: !isDevMode(),
    //   // Register the ServiceWorker as soon as the application is stable
    //   // or after 30 seconds (whichever comes first).
    //   registrationStrategy: 'registerWhenStable:30000'
    // })
  ],
  exports: [
    GetCategoryNamePipe,
    GetWorkspaceNamePipe,
    ParseIntPipe,
    ParseIntContentPipe
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
