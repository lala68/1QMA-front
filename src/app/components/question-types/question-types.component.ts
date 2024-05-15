import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DynamicFormComponent} from "../dynamic-form/dynamic-form.component";
import {SharedModule} from "../../shared/shared.module";

@Component({
  selector: 'app-question-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent, FormsModule, SharedModule],
  templateUrl: './question-types.component.html',
  styleUrl: './question-types.component.scss'
})
export class QuestionTypesComponent {
  data: any =[{},{}];

  constructor() {
  }

}
