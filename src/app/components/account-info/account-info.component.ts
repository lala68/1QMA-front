import {Component, Inject, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ClientService} from "../../services/client/client.service";
import {GeneralService} from "../../services/general/general.service";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {Router, RouterModule} from "@angular/router";
import {NgxMatIntlTelInputComponent} from "ngx-mat-intl-tel-input";
import {TranslateModule} from "@ngx-translate/core";
import {Preferences} from "@capacitor/preferences";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConfigService} from "../../services/config/config.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {MaterialModule} from "../../shared/material/material.module";
import {GamesService} from "../../services/games/games.service";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    NgxMatIntlTelInputComponent, TranslateModule],
  templateUrl: './account-info.component.html',
  styleUrl: './account-info.component.scss'
})
export class AccountInfoComponent {
  form: FormGroup = new FormGroup({}); // Initialize with an empty form group
  cities: any;
  loading: boolean = true;
  loadingUpload: boolean = false;

  constructor(private clientService: ClientService, private _formBuilder: FormBuilder, private _snackBar: MatSnackBar,
              public generalService: GeneralService, public dialog: MatDialog, public configService: ConfigService,
              private processHTTPMsgService: ProcessHTTPMsgService) {
    this.generalService.currentRout = '';
  }

  async ngOnInit(): Promise<any> {
    await this.generalService?.getUserData();
    this.generalService.countryListEng = await this.generalService.getCountries();

    this.form = this._formBuilder.group({
      firstName: [this.generalService.userObj?.firstName ? this.generalService.userObj?.firstName : '', [Validators.required]],
      lastName: [this.generalService.userObj?.lastName ? this.generalService.userObj?.lastName : '', [Validators.required]],
      email: [{
        value: this.generalService.userObj?.email,
        disabled: true
      }, [Validators.required, Validators.email]],
      mobile: [this.generalService.userObj?.mobile ? this.generalService.userObj?.mobile : '', [Validators.required]],
      gender: [this.generalService.userObj?.gender ? this.generalService.userObj?.gender?._id : '', []],
      country: [this.generalService.userObj?.country ? this.generalService.userObj?.country : '', []],
      education: [this.generalService.userObj?.education ? this.generalService.userObj?.education?._id : '', []],
      city: [this.generalService.userObj?.city ? this.generalService.userObj?.city : '', []],
      currentPassword: ['', []],
      password: ['', []],
      passwordConfirmation: ['', []],
    });
    this.loading = false;
  }

  async updateProfile() {
    this.loading = true;
    this.clientService.updateProfileClient(this.form.value, this.generalService.userId).then(async data => {
      this.loading = false;
      if (data.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        this.openDialog(data.message, 'Success');
      } else {
        this.openDialog(data.message, 'Error');
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);
    });
  }

  public OpenAddFilesDialog() {
    const dialogRef = this.dialog.open(ProfilePicture, {
      width: '700px',
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result == 'success') {
      }
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

  async removeProfilePicture() {
    this.loadingUpload = true;
    this.clientService.removeProfilePicture().then(async data => {
      this.loadingUpload = false;
      if (data.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        this.openDialog(data.message, 'Success');
      }
    }, error => {
      this.loadingUpload = false;
      this.openDialog(JSON.stringify(error.error), 'Error');
    })
  }
}

@Component({
  selector: 'profile-picture',
  templateUrl: 'profile-picture.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, SharedModule, TranslateModule],
})

export class ProfilePicture {
  @ViewChild('FileSelectInputDialog') FileSelectInputDialog: any;
  loading: boolean = false;
  loadingUpload: boolean = false;
  imagePath: any;
  fileToUpload: any;
  imageName: any = 'avatar-1';
  selectedAvatar: any = [];

  constructor(public dialogRef: MatDialogRef<ProfilePicture>, public configService: ConfigService,
              private clientService: ClientService,
              public dialog: MatDialog, private gameService: GamesService, public generalService: GeneralService,
              @Inject(MAT_DIALOG_DATA) public data: any, private router: Router, private _snackBar: MatSnackBar) {
  }

  async closeModal() {
    this.dialogRef.close();
  }

  public openAddFilesDialog() {
    const e: HTMLElement = this.FileSelectInputDialog.nativeElement;
    e.click();
  }

  async imageProfileInput(event: any) {
    this.fileToUpload = event.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2 MB in bytes

    // Allowed MIME types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg'];

    // Check file size
    if (this.fileToUpload.size > maxSize) {
      this.openDialog('maximum size is 2M.', 'Error');
      return;
    }

    // Check file type
    if (!allowedTypes.includes(this.fileToUpload.type)) {
      this.openDialog('Allowed format file is png,jpeg, webp and svg.', 'Error');
      return;
    }

    // Proceed with the upload
    await this.uploadImg();
  }

  async uploadImg() {
    this.loadingUpload = true;
    this.clientService.postProfilePicture(this.fileToUpload).then(async data => {
      this.loadingUpload = false;
      if (data.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
        await this.generalService.getUserData();
        this.openDialog(data.message, 'Success');
        await this.closeModal();
      }
    }, error => {
      this.loadingUpload = false;
      this.openDialog(JSON.stringify(error.error), 'Error');
    })
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

  async uploadImageFromAssets() {
    this.loadingUpload = true;
    const imagePath = 'assets/images/' + this.imageName + '.png';
    this.clientService.uploadImage(imagePath).subscribe(async response => {
      console.log(response)
      if (response.status == 1) {
        await Preferences.remove({key: 'account'});
        await Preferences.set({key: 'account', value: JSON.stringify(response.data)});
        await this.generalService.getUserData();
        this.openDialog(response.message, 'Success');
        await this.closeModal();
      }
    }, error => {
      this.loadingUpload = false;
      this.openDialog(JSON.stringify(error.error), 'Error');
    });
  }

  selectAvatar(item: any) {
    this.selectedAvatar = [];
    this.selectedAvatar.push(item);
    this.imageName = 'avatar-' + item;
  }

  isSelectedAvatar(item: any): boolean {
    return this.selectedAvatar.some((game: any) => game === item);
  }

}
