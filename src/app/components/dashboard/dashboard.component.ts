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
import {DialogContentComponent} from "../dialog-content/dialog-content.component";
import {MatDialog} from "@angular/material/dialog";

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

  constructor(private clientService: ClientService, private _formBuilder: FormBuilder,
              public generalService: GeneralService, public configService: ConfigService,
              private router: Router, public dialog: MatDialog,) {
    this.generalService.currentRout = '/dashboard';
  }

  async ngOnInit(): Promise<any> {
    await this.generalService.getUserData();
    this.loading = false;
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
    this.dialog.open(DialogContentComponent, {data: {message: message, title: title}});
  }

  copyText() {
    this.openDialog('copied.', 'Success');
  }
}
