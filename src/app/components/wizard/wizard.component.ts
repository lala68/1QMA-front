import {Component, OnInit, viewChild, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {PersonalInformationComponent} from "../personal-information/personal-information.component";
import {PreferencesComponent} from "../preferences/preferences.component";
import {MatStepper} from "@angular/material/stepper";
import {QuestionTypesComponent} from "../question-types/question-types.component";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {AuthService} from "../../services/auth/auth.service";
import {Preferences} from "@capacitor/preferences";

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, PersonalInformationComponent,
    PreferencesComponent, QuestionTypesComponent, TranslateModule],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.scss',
  providers: [PersonalInformationComponent]
})
export class WizardComponent implements OnInit {
  @ViewChild(MatStepper) stepper: any;
  selectedType: any = [];
  loadingAccountType: boolean = false;

  firstFormGroup = this._formBuilder.group({
    language: ['English', Validators.required],
  });
  form: FormGroup = new FormGroup({}); // Initialize with an empty form group

  accountTypeForm = this._formBuilder.group({
    type: ['', Validators.required],
  });
  error: any;
  loadingLanguage: boolean = false;

  constructor(private _formBuilder: FormBuilder, public personalInformationPage: PersonalInformationComponent,
              public generalService: GeneralService, public authService: AuthService) {
    if (this.generalService?.userObj?.preferedCategories) {
      this.selectedType = this.generalService?.userObj?.accountType;
    }
  }

  async ngOnInit(): Promise<any> {
    this.firstFormGroup = this._formBuilder.group({
      language: [this.generalService?.userObj?.preferedLanguage ? this.generalService?.userObj?.preferedLanguage : 'en', [Validators.required]],
    });
  }


  selectType(item: any) {
    this.selectedType = item;
  }

  submitAccountType() {
    this.loadingAccountType = true;
    this.error = '';
    this.authService.updateAccountType(this.selectedType).then(async data => {
      this.loadingAccountType = false;
      if (data.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        await this.stepper.next();
      } else {
        this.error = data.message;
      }
    })
  }

  async saveLanguage(): Promise<void> {
    this.loadingLanguage = true;
    this.error = '';
    this.authService.updateLanguage(this.firstFormGroup.controls.language.value).then(async data => {
      this.loadingLanguage = false;
      if (data.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        await this.stepper.next();
      } else {
        this.error = data.message;
      }
    })

  }
}
