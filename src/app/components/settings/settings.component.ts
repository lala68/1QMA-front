import {Component, OnInit} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ClientService} from "../../services/client/client.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {Preferences} from "@capacitor/preferences";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";

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
    font: [''],
    defaultHomePage: [''],
  });
  loading: boolean = false;
  availableFonts: string[] = ['Rokh', 'Exo', 'Anjoman', 'Daal', 'Damavand', 'Dana', 'Farhang', 'Irancell', 'IRANSans',
    'Kohinoor', 'Peyda', 'Pinar'];


  constructor(public generalService: GeneralService, private _formBuilder: FormBuilder, public dialog: MatDialog,
              private translateService: TranslateService,
              private clientService: ClientService, private _snackBar: MatSnackBar, private processHTTPMsgService: ProcessHTTPMsgService) {
    this.generalService.currentRout = '';
  }

  ngOnInit(): void {
    this.settingsForm = this._formBuilder.group({
      language: [this.generalService.userObj?.preferedLanguage ? this.generalService.userObj?.preferedLanguage?._id : '0'],
      font: [this.generalService.userObj?.preferedFont ? this.generalService.userObj?.preferedFont : 'Exo'],
      defaultHomePage: [this.generalService.userObj?.defaultHomePage ? this.generalService.userObj?.defaultHomePage : '/dashboard'],
    });
  }

  // async onFontSelect(font: any) {
  //   this.generalService.font = font.value;
  // }

  async updateSettings() {
    this.loading = true;
    this.clientService.updateSettings(this.settingsForm.value, this.generalService.userId).then(async data => {
      if (data.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        this.translateService.use(this.generalService.userObj?.preferedLanguage?.code); // If using ngx-translate
        document.documentElement.dir = this.generalService.userObj?.preferedLanguage?.code != 'fa' ? 'ltr' : 'rtl';
        this.generalService.direction = document.documentElement.dir;
        const bootstrapRTL = document.getElementById('bootstrapRTL') as HTMLLinkElement;
        bootstrapRTL.disabled = document.documentElement.dir !== 'rtl';
        // this.generalService.updateFontBasedOnLanguage(this.generalService.userObj?.preferedLanguage?.code);
        this.generalService.onFontSelect(this.generalService.userObj?.preferedFont)
        this.loading = false;
        this.openDialog(data.message, 'Success');
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
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
