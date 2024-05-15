import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {TranslateModule} from "@ngx-translate/core";

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

  constructor(private _formBuilder: FormBuilder, public dialog: MatDialog, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      country: ['', [Validators.required]],
      education: ['', [Validators.required]],
      city: ['', [Validators.required]],
    });
  }

  onSubmit() {

  }

  countryChangedEvent(event: any) {

  }

  openVerificationModal() {
    this.openDialogVerification('0', '0');
  }

  openDialogVerification(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(VerificationDialog, {
      width: '500px',
      data: {
        email: this.form.get('email')?.value, phone: this.form.get('phone')?.value
      },
      enterAnimationDuration,
      exitAnimationDuration,
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        console.log(result)
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
  verifyForm = this._formBuilder.group({
    phoneCode: new FormControl('', [Validators.required]),
    emailCode: new FormControl('', [Validators.required]),
  });
  countDownPhone = 10;
  countDownEmail = 10;
  resendAblePhone = false;
  resendAbleEmail = false;
  intervalIdEmail: any;
  intervalIdPhone: any;
  loadingCodeEmail = false;
  loadingCodePhone = false;
  email: any;
  phone: any;

  constructor(public dialogRef: MatDialogRef<VerificationDialog>, private _formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.email = data?.email;
    this.phone = data?.phone;
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

  submit() {

  }
}
