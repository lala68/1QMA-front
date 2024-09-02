import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";

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

  constructor(private _formBuilder: FormBuilder,) {
  }

  updateWordCount() {
    this.wordCount = this.reportForm.controls.description.value ? (100 - this.reportForm.controls.description.value.trim().split(/\s+/).length) : 100;
  }

  onSubmit() {

  }

}
