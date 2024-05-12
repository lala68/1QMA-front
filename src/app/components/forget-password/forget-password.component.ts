import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {Router, RouterModule} from "@angular/router";
import {MaterialModule} from "../../shared/material/material.module";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, RouterModule, MaterialModule, NgxMatIntlTelInputComponent],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  step: any = 1;
  type: any;
  email: any;
  phone: any;
  resetPasswordForm = this._formBuilder.group({
    verification: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    retypePassword: new FormControl('', [Validators.required]),
  });

  constructor(private _formBuilder: FormBuilder, private router: Router) {
  }

  gotoStepTwo(type: any) {
    this.step = 2;
    this.type = type;
  }

  gotoStepThree() {
    this.step = 3;
  }

  onSubmit() {
    this.step = 4;
  }

  countryChangedEvent(event: any) {

  }

  async prevStep() {
    if (this.step === 1) {
      await this.router.navigateByUrl('/login');
    } else {
      --this.step;
    }
  }


}
