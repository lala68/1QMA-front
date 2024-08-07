import {Component, OnInit} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {ClientService} from "../../services/client/client.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {Preferences} from "@capacitor/preferences";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settingsForm = this._formBuilder.group({
    language: [''],
    defaultHomePage: [''],
  });
  loading: boolean = false;
  error: any = '';

  constructor(public generalService: GeneralService, private _formBuilder: FormBuilder, public dialog: MatDialog,
              private clientService: ClientService, private _snackBar: MatSnackBar) {
    this.generalService.currentRout = '';
    console.log(this.generalService.userObj)
  }

  async ngOnInit(): Promise<any> {
    this.settingsForm = this._formBuilder.group({
      language: [this.generalService.userObj?.preferedLanguage ? this.generalService.userObj?.preferedLanguage : '0'],
      defaultHomePage: [this.generalService.userObj?.defaultHomePage ? this.generalService.userObj?.defaultHomePage : '/dashboard'],
    });
  }

  async updateSettings() {
    this.loading = true;
    this.error = '';
    this.clientService.updateSettings(this.settingsForm.value, this.generalService.userId).then(async data => {
      if (data.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        this.loading = false;
        this.openDialog(data.message, 'Success');
      } else {
        this.error = data.message;
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
