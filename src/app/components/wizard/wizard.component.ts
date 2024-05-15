import {Component, viewChild, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {PersonalInformationComponent} from "../personal-information/personal-information.component";
import {PreferencesComponent} from "../preferences/preferences.component";
import {MatStepper} from "@angular/material/stepper";
import {QuestionTypesComponent} from "../question-types/question-types.component";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, PersonalInformationComponent,
    PreferencesComponent, QuestionTypesComponent, TranslateModule],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.scss',
  providers: [PersonalInformationComponent]
})
export class WizardComponent {
  @ViewChild(MatStepper) stepper: any;
  selectedType: any = [];

  firstFormGroup = this._formBuilder.group({
    language: ['', Validators.required],
  });
  form: FormGroup = new FormGroup({}); // Initialize with an empty form group

  accountTypeForm = this._formBuilder.group({
    type: ['', Validators.required],
  });

  constructor(private _formBuilder: FormBuilder, public personalInformationPage: PersonalInformationComponent) {
  }

  selectType(item: any) {
    this.selectedType = item;
  }
}
