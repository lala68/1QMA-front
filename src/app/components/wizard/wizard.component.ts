import {
  Component,
  ContentChild,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Inject,
  OnInit,
  viewChild,
  ViewChild
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {MatStepper} from "@angular/material/stepper";
import {QuestionTypesComponent} from "../question-types/question-types.component";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {AuthService} from "../../services/auth/auth.service";
import {Preferences} from "@capacitor/preferences";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {MaterialModule} from "../../shared/material/material.module";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {DomSanitizer} from "@angular/platform-browser";
import {SafeUrlPipe} from "../../pipes/safe-url.pipe";
import SwiperCore from 'swiper';
import {SwiperOptions} from "swiper/types";
import {SwiperContainer} from 'swiper/element/bundle';
import {Subject, takeUntil} from "rxjs";

SwiperCore.use([]);

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    QuestionTypesComponent, TranslateModule, NgxMatIntlTelInputComponent, SafeUrlPipe],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.scss',
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WizardComponent implements OnInit {
  @ViewChild('stepper') stepper: any = {selectedIndex: 0};
  @ContentChild('swiper') swiperRef!: ElementRef<SwiperContainer>;
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
  loadingLanguage: boolean = true;
  loadingUserData: boolean = true;
  hide = true;
  selectedCategory: any = [];
  email: any;
  innerStep: any = 1;
  answers: any[] = [];
  innerExplanation: any;
  config: SwiperOptions = {
    effect: 'coverflow',
    pagination: {clickable: true},
    allowSlideNext: false,
    allowSlidePrev: true
  };
  currentIndex: number = 0;
  steps = [
    {name: 'Step 1', progress: 20},
    {name: 'Step 2', progress: 40},
    {name: 'Step 3', progress: 60},
    {name: 'Step 4', progress: 80},
    {name: 'Step 5', progress: 100}
  ];
  countryFilterCtrl = new FormControl();
  filteredCountries: any[] = [];
  private _onDestroy = new Subject<void>();

  constructor(private _formBuilder: FormBuilder, private router: Router, private translateService: TranslateService,
              public generalService: GeneralService, public authService: AuthService, public dialog: MatDialog,) {
    if (this.generalService.userObj?.preferedCategories) {
      // this.selectedType = this.generalService.userObj?.accountType;
      this.selectedCategory = this.generalService.userObj?.preferedCategories;
    }

    this.generalService?.initData?.furtherQuestions.forEach((slide: any) => {
      this.answers.push({_id: slide._id, question: slide.question, answer: null});
    });
  }

  async ngOnInit(): Promise<any> {
    ////should be commented
    this.authService.registerInit().then(res => {
      if (res.status == 1) {
        this.generalService.initData = res.data;
        this.loadingLanguage = false;
      }
    })
    //////

    await this.generalService?.getUserData();
    await this.translateService.use(this.generalService.userObj?.preferedLanguage?.code).toPromise(); // If using ngx-translate
    document.documentElement.dir = this.generalService.userObj?.preferedLanguage?.code != 'fa' ? 'ltr' : 'rtl';
    this.generalService.direction = document.documentElement.dir;
    const bootstrapRTL = document.getElementById('bootstrapRTL') as HTMLLinkElement;
    bootstrapRTL.disabled = document.documentElement.dir !== 'rtl';
    this.generalService.countryListEng = await this.generalService.getCountries();
    // Load the initial country list
    this.filteredCountries = await this.generalService.getCountries();

    // Listen for search field value changes
    this.countryFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCountries();
      });

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
      }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      mobile: [this.generalService.userObj?.mobile ? this.generalService.userObj?.mobile : '', [Validators.required, Validators.minLength(10)]],
      gender: [this.generalService.userObj?.gender ? this.generalService.userObj?.gender?._id : '', [Validators.required]],
      country: [this.generalService.userObj?.country ? this.generalService.userObj?.country : '', [Validators.required]],
      education: [this.generalService.userObj?.education ? this.generalService.userObj?.education?._id : '', [Validators.required]],
      city: [this.generalService.userObj?.city ? this.generalService.userObj?.city : '', [Validators.required]],
    });
    await this.setPasswordValidators();
  }

  private filterCountries() {
    const search = this.countryFilterCtrl.value ? this.countryFilterCtrl.value.toLowerCase() : '';
    this.filteredCountries = this.generalService.countryListEng
      .filter((country: any) => country.name.toLowerCase().includes(search));
  }

  selectType(item: any) {
    this.selectedType = item;
  }

  gotoExplanationDetail(item: any) {
    this.innerStep = 2;
    this.innerExplanation = item;
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
      // this.loadingLanguage = false;
      if (data.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        await this.translateService.use(this.generalService.userObj?.preferedLanguage?.code).toPromise(); // If using ngx-translate
        document.documentElement.dir = this.generalService.userObj?.preferedLanguage?.code != 'fa' ? 'ltr' : 'rtl';
        this.generalService.direction = document.documentElement.dir;
        const bootstrapRTL = document.getElementById('bootstrapRTL') as HTMLLinkElement;
        bootstrapRTL.disabled = document.documentElement.dir !== 'rtl';
        setTimeout(async () => {
          this.form = this._formBuilder.group({
            firstName: [this.generalService.userObj?.firstName ? this.generalService.userObj?.firstName : '', [Validators.required]],
            lastName: [this.generalService.userObj?.lastName ? this.generalService.userObj?.lastName : '', [Validators.required]],
            email: [{
              value: this.email ? this.email : this.generalService.userObj?.email,
              disabled: true
            }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
            mobile: [this.generalService.userObj?.mobile ? this.generalService.userObj?.mobile : '', [Validators.required, Validators.minLength(10)]],
            gender: [this.generalService.userObj?.gender ? this.generalService.userObj?.gender?._id : '', [Validators.required]],
            country: [this.generalService.userObj?.country ? this.generalService.userObj?.country : '', [Validators.required]],
            education: [this.generalService.userObj?.education ? this.generalService.userObj?.education?._id : '', [Validators.required]],
            city: [this.generalService.userObj?.city ? this.generalService.userObj?.city : '', [Validators.required]],
          });
          await this.stepper.next();
        }, 1000)
      } else {
        this.error = data.message;
      }
    })
  }

  async submitAnswers() {
    this.loading = true;
    this.error = '';
    this.authService.answerFurtherQuestions(this.answers).then(async data => {
      if (data.status == 1) {
        this.loading = false;
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        await this.stepper.next();
      } else {
        this.loading = false;
        this.error = data.message;
      }
    })
  }

  async gotoPrevStep() {
    const index = this.stepper?.selectedIndex;
    if (index > 0) {
      this.loadingLanguage = false;
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
    const dialogConfig = new MatDialogConfig();
    // Check if it's mobile
    console.log(this.form.get('mobile')?.value)
    if (this.generalService.isMobileView) { // Assuming mobile devices are <= 768px
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.height = 'auto'; // You can specify the height if needed
      dialogConfig.position = {bottom: '0px'};
      dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
      dialogConfig.data = {email: this.form.get('email')?.value, phone: this.form.get('mobile')?.value};
      dialogConfig.enterAnimationDuration = enterAnimationDuration;
      dialogConfig.exitAnimationDuration = exitAnimationDuration
    } else {
      dialogConfig.data = {email: this.form.get('email')?.value, phone: this.form.get('mobile')?.value};
      dialogConfig.enterAnimationDuration = enterAnimationDuration;
      dialogConfig.exitAnimationDuration = exitAnimationDuration
      dialogConfig.width = '700px'; // Full size for desktop or larger screens
    }
    const dialogRef = this.dialog.open(VerificationDialog, dialogConfig);
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
    const index = this.selectedCategory.findIndex((data: any) => data._id === item._id);
    if (index !== -1) {
      // Remove the item from the array
      this.selectedCategory.splice(index, 1);
    } else {
      this.selectedCategory.push(item);
    }
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

// To collect text input
  collectTextAnswer(slide: any, event: Event) {
    const inputElement = event.target as HTMLTextAreaElement;
    const answer = inputElement?.value || '';
    this.updateAnswer(slide, answer);
  }

  // To collect multiple choice answers
  selectQuestion(slide: any, option: string) {
    const existingAnswer = this.answers.find(a => a._id === slide._id);
    if (existingAnswer) {
      if (Array.isArray(existingAnswer.answer)) {
        const index = existingAnswer.answer.indexOf(option);
        if (index >= 0) {
          existingAnswer.answer.splice(index, 1);
        } else {
          existingAnswer.answer.push(option);
        }
      } else {
        existingAnswer.answer = [option];
      }
    } else {
      this.answers.push({
        _id: slide._id,
        question: slide.question,
        answer: [option]
      });
    }
    this.checkSlideCompletion();
  }

  // To collect selected option from dropdown
  selectDropdownAnswer(slide: any, answer: any) {
    this.updateAnswer(slide, answer);
  }

  updateAnswer(slide: any, answer: any) {
    const existingAnswer = this.answers.find(a => a._id === slide._id);
    if (existingAnswer) {
      existingAnswer.answer = answer;
    } else {
      this.answers.push({
        _id: slide._id,
        question: slide.question,
        answer: answer
      });
    }
    this.checkSlideCompletion();
  }

  // Check if current slide is completed
  checkSlideCompletion() {
    const currentSlideAnswer = this.answers[this.currentIndex];
    if (currentSlideAnswer?.answer) {
      this.config.allowSlideNext = true;
    } else {
      this.config.allowSlideNext = false;
    }
  }

  // Handle slide change event
  onSlideChange() {
    this.currentIndex = this.swiperRef.nativeElement.swiper.realIndex;
    this.checkSlideCompletion();
  }

  isSelectedQuestion(slide: any, option: string): boolean {
    const existingAnswer = this.answers.find(a => a._id === slide._id);
    return existingAnswer && Array.isArray(existingAnswer.answer) && existingAnswer.answer.includes(option);
  }

  // Method to handle the change event
  onToggleChange(slide: any, event: any) {
    const toggleValue = event.checked ? 1 : 0;
    this.updateAnswer(slide, toggleValue)
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
    email: new FormControl({value: '', disabled: true}, [Validators.required,]),
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
    console.log(data)
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

