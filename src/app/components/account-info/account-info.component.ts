import {Component} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ClientService} from "../../services/client/client.service";
import {GeneralService} from "../../services/general/general.service";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {RouterModule} from "@angular/router";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {TranslateModule} from "@ngx-translate/core";
import {Preferences} from "@capacitor/preferences";

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, NgxMatIntlTelInputComponent, TranslateModule],
  templateUrl: './account-info.component.html',
  styleUrl: './account-info.component.scss'
})
export class AccountInfoComponent {
  form: FormGroup = new FormGroup({}); // Initialize with an empty form group
  cities: any;
  loading: boolean = true;

  constructor(private clientService: ClientService, private _formBuilder: FormBuilder, public generalService: GeneralService) {
  }

  async ngOnInit(): Promise<any> {
    await this.generalService?.getUserData();
    this.generalService.countryListEng = await this.generalService.getCountries();

    this.form = this._formBuilder.group({
      firstName: [this.generalService?.userObj?.firstName ? this.generalService?.userObj?.firstName : '', [Validators.required]],
      lastName: [this.generalService?.userObj?.lastName ? this.generalService?.userObj?.lastName : '', [Validators.required]],
      email: [{
        value: this.generalService?.userObj?.email,
        disabled: true
      }, [Validators.required, Validators.email]],
      mobile: [this.generalService?.userObj?.mobile ? this.generalService?.userObj?.mobile : '', [Validators.required]],
      gender: [this.generalService?.userObj?.gender ? this.generalService?.userObj?.gender : '', []],
      country: [this.generalService?.userObj?.country ? this.generalService?.userObj?.country : '', []],
      education: [this.generalService?.userObj?.education ? this.generalService?.userObj?.education : '', []],
      city: [this.generalService?.userObj?.city ? this.generalService?.userObj?.city : '', []],
      currentPassword: ['', []],
      password: ['', []],
      passwordConfirmation: ['', []],
    });
    this.loading = false;
  }

  async updateProfile() {
    this.clientService.updateProfileClient(this.form.value, this.generalService.userId).then(async data => {
      if (data.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
      }
    })
  }
}
