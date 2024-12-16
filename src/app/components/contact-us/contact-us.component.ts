import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {ClientService} from "../../services/client/client.service";
import {GeneralService} from "../../services/general/general.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, SharedModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent {
  loading: boolean = false;
  contactForm = this._formBuilder.group({
    email: new FormControl({
      value: this.generalService.userObj ? this.generalService.userObj?.email : '',
      disabled: this.generalService.userObj
    }, [Validators.required, Validators.email]),
    name: new FormControl({
      value: this.generalService.userObj ? this.generalService.userObj.firstName + ' ' + this.generalService.userObj.lastName : '',
      disabled: this.generalService.userObj
    }, [Validators.required]),
    message: new FormControl('', [Validators.required]),
  });

  constructor(private _formBuilder: FormBuilder, private clientService: ClientService,
              public generalService: GeneralService, private _snackBar: MatSnackBar,
              private processHTTPMsgService: ProcessHTTPMsgService) {
  }

  onSubmit() {
    const data = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      message: this.contactForm.value.message
    };

    this.clientService.postContactUs(data).then(data => {
      if (data.status == 1) {
        if (this.generalService.userObj) {
          this.contactForm.controls.message.setValue('');
        } else {
          this.contactForm.controls.name.setValue('');
          this.contactForm.controls.email.setValue('');
          this.contactForm.controls.message.setValue('');
        }
        this.openDialog(data.message, 'Success');
      } else {
        this.openDialog(JSON.stringify(data.message), 'Error');
      }
    }, error => {
      return this.processHTTPMsgService.handleError(error);

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


}
