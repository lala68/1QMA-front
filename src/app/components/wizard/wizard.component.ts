import {Component, Inject, OnInit, viewChild, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {MatStepper} from "@angular/material/stepper";
import {QuestionTypesComponent} from "../question-types/question-types.component";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {AuthService} from "../../services/auth/auth.service";
import {Preferences} from "@capacitor/preferences";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    QuestionTypesComponent, TranslateModule, NgxMatIntlTelInputComponent],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.scss',
  providers: []
})
export class WizardComponent implements OnInit {
  @ViewChild('stepper') stepper: any = {selectedIndex: 0};
  selectedType: any = '664f56e20b34ac027d3f8260';
  loadingAccountType: boolean = false;

  firstFormGroup = this._formBuilder.group({
    language: ['English', Validators.required],
  });
  form: FormGroup = new FormGroup({}); // Initialize with an empty form group
  // steps: number[] = [0, 1, 2, 3, 4, 5]; // Number of steps
  accountTypeForm = this._formBuilder.group({
    type: ['', Validators.required],
  });
  error: any;
  loading: boolean = false;
  loadingLanguage: boolean = false;
  loadingUserData: boolean = true;
  hide = true;
  selectedCategory: any = [];
  email: any;
  steps = [
    {name: 'Step 1', progress: 20},
    {name: 'Step 2', progress: 40},
    {name: 'Step 3', progress: 60},
    {name: 'Step 4', progress: 80},
    {name: 'Step 5', progress: 100}
  ];

  constructor(private _formBuilder: FormBuilder, private router: Router,
              public generalService: GeneralService, public authService: AuthService, public dialog: MatDialog,) {
    if (this.generalService.userObj?.preferedCategories) {
      // this.selectedType = this.generalService.userObj?.accountType;
      this.selectedCategory = this.generalService.userObj?.preferedCategories;
    }
  }

  async ngOnInit(): Promise<any> {
    await this.generalService?.getUserData();
    this.generalService.countryListEng = await this.generalService.getCountries();

    this.email = this.router.getCurrentNavigation()?.extras?.state?.['email'] ? this.router.getCurrentNavigation()?.extras?.state?.['email'] : this.generalService.userObj?.email;
    this.firstFormGroup = this._formBuilder.group({
      language: [this.generalService.userObj?.preferedLanguage ? this.generalService.userObj?.preferedLanguage?._id : '0', [Validators.required]],
    });
    this.form = this._formBuilder.group({
      firstName: [this.generalService.userObj?.firstName ? this.generalService.userObj?.firstName : '', [Validators.required]],
      lastName: [this.generalService.userObj?.lastName ? this.generalService.userObj?.lastName : '', [Validators.required]],
      email: [{
        value: this.email ? this.email : this.generalService.userObj?.email,
        disabled: true
      }, [Validators.required, Validators.email]],
      mobile: [this.generalService.userObj?.mobile ? this.generalService.userObj?.mobile : '', [Validators.required]],
      gender: [this.generalService.userObj?.gender ? this.generalService.userObj?.gender?._id : '', []],
      country: [this.generalService.userObj?.country ? this.generalService.userObj?.country : '', []],
      education: [this.generalService.userObj?.education ? this.generalService.userObj?.education?._id : '', []],
      city: [this.generalService.userObj?.city ? this.generalService.userObj?.city : '', []],
    });
    await this.setPasswordValidators();
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
        setTimeout(async () => {
          this.form = this._formBuilder.group({
            firstName: [this.generalService.userObj?.firstName ? this.generalService.userObj?.firstName : '', [Validators.required]],
            lastName: [this.generalService.userObj?.lastName ? this.generalService.userObj?.lastName : '', [Validators.required]],
            email: [{
              value: this.email ? this.email : this.generalService.userObj?.email,
              disabled: true
            }, [Validators.required, Validators.email]],
            mobile: [this.generalService.userObj?.mobile ? this.generalService.userObj?.mobile : '', [Validators.required]],
            gender: [this.generalService.userObj?.gender ? this.generalService.userObj?.gender?._id : '', []],
            country: [this.generalService.userObj?.country ? this.generalService.userObj?.country : '', []],
            education: [this.generalService.userObj?.education ? this.generalService.userObj?.education?._id : '', []],
            city: [this.generalService.userObj?.city ? this.generalService.userObj?.city : '', []],
          });
          await this.stepper.next();
        }, 1000)
      } else {
        this.error = data.message;
      }
    })
  }

  async gotoPrevStep() {
    const index = this.stepper?.selectedIndex;
    if (index > 0) {
      await this.stepper.previous();
    }
  }


  async setPasswordValidators(): Promise<void> {
    // Your condition to check if the password should be required
    const isPasswordRequired = !this.generalService.userObj?.password;

    if (isPasswordRequired) {
      this.form.get('password')?.setValidators([Validators.required]);
    } else {
      this.form.get('password')?.clearValidators();
    }

    // Update the validity of the password field
    await this.form.get('password')?.updateValueAndValidity();
    this.loadingUserData = false;
    console.log(this.generalService.userObj)
  }

  countryChangedEvent(event: any) {

  }

  openVerificationModal() {
    this.loading = true;
    this.error = '';
    console.log(this.form.value)
    this.authService.updateProfile(this.form.value, this.generalService.userId).then(async data => {
      this.loading = false;
      if (data?.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        if (!this.generalService.userObj?.emailVerified || !this.generalService.userObj?.mobileVerified) {
          this.openDialogVerification('0', '0');
        } else {
          this.stepper.next();
        }
      } else if (data?.status == -1) {
        this.error = data?.message;
      }
    })
  }

  openDialogVerification(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(VerificationDialog, {
      width: '500px',
      data: {
        email: this.form.get('email')?.value, phone: this.form.get('mobile')?.value
      },
      enterAnimationDuration,
      exitAnimationDuration,
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
        this.stepper.next();
      }
    });
  }

  isSelected(item: any): boolean {
    return this.selectedCategory.some((category: any) => category._id === item._id);
  }

  selectCat(item: any) {
    console.log(this.selectedCategory)
    const index = this.selectedCategory.findIndex((data: any) => data._id === item._id);
    console.log(index)
    if (index !== -1) {
      // Remove the item from the array
      this.selectedCategory.splice(index, 1);
    } else {
      this.selectedCategory.push(item);
    }
    // const indexId = this.selectedCategoryId.indexOf(item._id);
    // if (indexId >= 0) {
    //   this.selectedCategoryId.splice(indexId, 1);
    // } else {
    //   this.selectedCategoryId.push(item?._id);
    // }
  }

  submitPref() {
    this.loading = true;
    this.error = '';
    this.authService.updateCategoryPreferences(this.selectedCategory).then(async data => {
      this.loading = false;
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

  getProgressValue(index: number): number {
    return this.steps[index].progress;
  }

  getProgressBarClass(index: number): string {
    return `progress-bar-${index}`;
  }
}


@Component({
  selector: 'verification',
  templateUrl: 'verification.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, SharedModule, TranslateModule, CountdownTimerComponent],
  providers: [CountdownTimerComponent]
})

export class VerificationDialog {
  verifyFormEmail = this._formBuilder.group({
    email: new FormControl({value: '', disabled: true}, [Validators.required]),
    verificationCode: new FormControl('', [Validators.required]),
  });
  verifyFormMobile = this._formBuilder.group({
    mobile: new FormControl({value: '', disabled: true}, [Validators.required]),
    verificationCode: new FormControl('', [Validators.required]),
  });
  resendAblePhone = false;
  resendAbleEmail = false;
  loadingCodeEmail = false;
  loadingCodePhone = false;
  loading = false;
  errorEmail: any;
  errorMobile: any;
  mobileSuccess: boolean = false;
  emailSuccess: boolean = false;

  constructor(public dialogRef: MatDialogRef<VerificationDialog>, private _formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService, public generalService: GeneralService) {
    this.verifyFormEmail.controls.email.setValue(data?.email);
    this.verifyFormMobile.controls.mobile.setValue(data?.phone);
  }


  handleCountdownFinishedEmail() {
    this.resendAbleEmail = true;
  }

  handleCountdownFinishedMobile() {
    this.resendAblePhone = true;
  }

  async resendCodeEmail() {
    this.resendAbleEmail = false;
    this.authService.resendCodeEmail({email: this.verifyFormEmail.controls.email.value}).then(data => {

    })
  }

  async resendCodePhone() {
    this.resendAblePhone = false;
    this.authService.resendCodeMobile({mobile: this.verifyFormMobile.controls.mobile.value}).then(data => {

    })
  }

  async submit() {
    this.loading = true;
    this.errorEmail = '';
    this.errorMobile = '';
    if (!this.generalService.userObj?.emailVerified) {
      await this.authService.verifyEmail(this.verifyFormEmail.getRawValue()).then(async data => {
        if (data?.status == 1) {
          // await Preferences.remove({key: 'account'});
          // await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
          // await this.generalService.getUserData();
          this.emailSuccess = true;
        } else if (data?.status == -1) {
          this.errorEmail = data?.message;
        }
      });
    } else {
      this.emailSuccess = true;
    }
    if (!this.generalService.userObj?.mobileVerified) {
      await this.authService.verifyMobile(this.verifyFormMobile.getRawValue()).then(async data => {
        this.loading = false;
        if (data?.status == 1) {
          // await Preferences.remove({key: 'account'});
          // await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
          // await this.generalService.getUserData();
          this.mobileSuccess = true;
        } else if (data?.status == -1) {
          this.errorMobile = data?.message;
        }
      });
    } else {
      this.mobileSuccess = true;
    }
    if (this.mobileSuccess && this.emailSuccess) {
      this.dialogRef.close('success')
    }
  }
}

