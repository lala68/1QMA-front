import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {AuthService} from "../../services/auth/auth.service";
import {Preferences} from "@capacitor/preferences";

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SharedModule, NgxMatIntlTelInputComponent, TranslateModule],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.scss',
})
export class PersonalInformationComponent implements OnInit {
  @Input() stepper: any;
  form: FormGroup = new FormGroup({}); // Initialize with an empty form group
  loading: boolean = false;
  error: any;

  constructor(private _formBuilder: FormBuilder, public dialog: MatDialog, public generalService: GeneralService,
              private authService: AuthService) {
  }

  async ngOnInit() {
    this.form = this._formBuilder.group({
      firstName: [this.generalService?.userObj?.firstName ? this.generalService?.userObj?.firstName : '', [Validators.required]],
      lastName: [this.generalService?.userObj?.lastName ? this.generalService?.userObj?.lastName : '', [Validators.required]],
      email: [this.generalService?.userObj?.email ? this.generalService?.userObj?.email : '', [Validators.required, Validators.email]],
      mobile: [this.generalService?.userObj?.mobile ? this.generalService?.userObj?.mobile : '', [Validators.required]],
      password: ['', [Validators.required]],
      gender: [this.generalService?.userObj?.gender ? this.generalService?.userObj?.gender : '', [Validators.required]],
      country: [this.generalService?.userObj?.country ? this.generalService?.userObj?.country : '', [Validators.required]],
      education: [this.generalService?.userObj?.education ? this.generalService?.userObj?.education : '', [Validators.required]],
      city: [this.generalService?.userObj?.city ? this.generalService?.userObj?.city : '', [Validators.required]],
    });
  }

  onSubmit() {

  }

  countryChangedEvent(event: any) {

  }

  openVerificationModal() {
    this.loading = true;
    this.error = '';
    this.authService.updateProfile(this.form.value, this.generalService.userId).then(async data => {
      this.loading = false;
      if (data?.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        this.openDialogVerification('0', '0');
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
}


@Component({
  selector: 'verification',
  templateUrl: 'verification.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, SharedModule, TranslateModule],
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
  countDownPhone = 10;
  countDownEmail = 10;
  resendAblePhone = false;
  resendAbleEmail = false;
  intervalIdEmail: any;
  intervalIdPhone: any;
  loadingCodeEmail = false;
  loadingCodePhone = false;
  loading = false;
  error: any;
  mobileSuccess: boolean = false;
  emailSuccess: boolean = false;

  constructor(public dialogRef: MatDialogRef<VerificationDialog>, private _formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService, private generalService: GeneralService) {
    this.verifyFormEmail.controls.email.setValue(data?.email);
    this.verifyFormMobile.controls.mobile.setValue(data?.phone);
    this.startTimerEmail();
    this.startTimerPhone();
  }

  startTimerEmail() {
    this.intervalIdEmail = setInterval(() => {
      if (this.countDownEmail > 0) {
        this.countDownEmail -= 1;
      } else {
        this.countDownEmail = 10;
        this.resendAbleEmail = true;
        this.loadingCodeEmail = false;
        clearInterval(this.intervalIdEmail);
      }
    }, 1000);
  }

  startTimerPhone() {
    this.intervalIdPhone = setInterval(() => {
      if (this.countDownPhone > 0) {
        this.countDownPhone -= 1;
      } else {
        this.countDownPhone = 10;
        this.resendAblePhone = true;
        this.loadingCodePhone = false;
        clearInterval(this.intervalIdPhone);
      }
    }, 1000);
  }

  async resendCodeEmail() {
    this.resendAbleEmail = false;
  }

  async resendCodePhone() {
    this.resendAblePhone = false;
  }

  async submit() {
    this.loading = true;
    this.error = '';
    await this.authService.verifyEmail(this.verifyFormEmail.getRawValue()).then(async data => {
      if (data?.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        this.emailSuccess = true;
      } else if (data?.status == -1) {
        this.error = data?.message;
      }
    });
    await this.authService.verifyMobile(this.verifyFormMobile.getRawValue()).then(async data => {
      this.loading = false;
      if (data?.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        this.mobileSuccess = true;
      } else if (data?.status == -1) {
        this.error = data?.message;
      }
    });
    if (this.mobileSuccess && this.emailSuccess) {
      this.dialogRef.close('success')
    }

  }
}
