import {Component, OnInit} from '@angular/core';
import {GeneralService} from "../../services/general/general.service";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {ClientService} from "../../services/client/client.service";

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

  constructor(public generalService: GeneralService, private _formBuilder: FormBuilder,
              private clientService: ClientService) {
  }

  async ngOnInit(): Promise<any> {
    this.settingsForm = this._formBuilder.group({
      language: [this.generalService?.userObj?.preferedLanguage ? this.generalService?.userObj?.preferedLanguage : 'en'],
      defaultHomePage: [this.generalService?.userObj?.preferedHomePage ? this.generalService?.userObj?.preferedHomePage : '/dashboard'],
    });
  }

  async updateSettings() {
    this.loading = true;
    this.error = '';
    this.clientService.updateSettings(this.settingsForm.value, this.generalService.userId).then(data => {
      if (data.status == 1) {
        this.loading = false;
      } else {
        this.error = data.message;
      }
    })
  }

}
