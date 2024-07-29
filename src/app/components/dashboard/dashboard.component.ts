import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {ClientService} from "../../services/client/client.service";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {GeneralService} from "../../services/general/general.service";
import {Router, RouterModule} from "@angular/router";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {TranslateModule} from "@ngx-translate/core";
import {ConfigService} from "../../services/config/config.service";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, NgxMatIntlTelInputComponent,
    TranslateModule, ClipboardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading: boolean = true;
  loadingInvite: boolean = false;
  invitedEmail: any;
  inviteForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  startDate: any; // in milliseconds
  expireDays: any;
  remainingDays: any;

  constructor(private clientService: ClientService, private _formBuilder: FormBuilder,
              public generalService: GeneralService, public configService: ConfigService,
              private router: Router, public dialog: MatDialog, private _snackBar: MatSnackBar) {
    this.generalService.currentRout = '/dashboard';
  }

  async ngOnInit(): Promise<any> {
    await this.generalService.getUserData();
    this.calculateRemainingDays();
    this.loading = false;
  }

  calculateRemainingDays(): void {
    // Convert startDate from milliseconds to a Date object
    const startDate = new Date(this.generalService.userObj.accountType.startDate);

    // Calculate the expiration date
    const expirationDate = new Date(startDate);
    expirationDate.setDate(expirationDate.getDate() + this.generalService.userObj.accountType.expireDays);

    // Get the current date
    const currentDate = new Date();

    // Calculate the difference between the expiration date and the current date
    const timeDiff = expirationDate.getTime() - currentDate.getTime();
    this.remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  async gotoUserDetail(id: any) {
    await this.router.navigate(['user-detail'], {state: {id: id}});
  }

  onSubmit() {
    this.loadingInvite = true;
    this.clientService.inviteFriend(this.inviteForm.value, this.generalService.userId).then(data => {
      this.loadingInvite = false;
      if (data.status == 1) {
        this.openDialog(data.message, 'Success');
      } else {
        this.openDialog(data.message, 'Error');
      }
    })
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
}
