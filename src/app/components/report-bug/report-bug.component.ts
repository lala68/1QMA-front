import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {ClientService} from "../../services/client/client.service";
import {GeneralService} from "../../services/general/general.service";
import {SnackbarContentComponent} from "../snackbar-content/snackbar-content.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProcessHTTPMsgService} from "../../services/proccessHttpMsg/process-httpmsg.service";

@Component({
  selector: 'app-report-bug',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, SharedModule, ReactiveFormsModule],
  templateUrl: './report-bug.component.html',
  styleUrl: './report-bug.component.scss'
})
export class ReportBugComponent {
  loading: boolean = false;
  wordCount: any = 100;
  reportForm = this._formBuilder.group({
    mainCategory: new FormControl('', [Validators.required]),
    subCategory: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });
  filteredSubCategories: any[] = [];

  constructor(private _formBuilder: FormBuilder, private clientService: ClientService,
              public generalService: GeneralService, private _snackBar: MatSnackBar,
              private processHTTPMsgService: ProcessHTTPMsgService) {
  }

  updateWordCount() {
    this.wordCount = this.reportForm.controls.description.value ? (100 - this.reportForm.controls.description.value.trim().split(/\s+/).length) : 100;
  }

  onSubmit() {
    const reportData = {
      id: this.generalService.userId,  // Generate the ID
      category: this.reportForm.value.mainCategory,  // Assuming category ID is static
      subCategory: this.reportForm.value.subCategory,  // Get the subcategory
      description: this.reportForm.value.description  // Get the description
    };

    this.clientService.postBugReport(reportData).then(data => {
      if (data.status == 1) {
        this.reportForm.reset();
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

  onMainCategoryChange(selectedCategoryId: string): void {
    const selectedCategory = this.generalService.clientInit.bugTypes.find((category: any) => category._id === selectedCategoryId);
    this.filteredSubCategories = selectedCategory ? selectedCategory.subCategories : [];
    // Clear the sub-category selection when the main category changes
    this.reportForm.get('subCategory')?.setValue(null);
  }


}
