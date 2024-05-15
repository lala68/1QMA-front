import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SharedModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit {
  @Input() properties: any;
  dynamicForm: FormGroup = new FormGroup({});

  constructor(private formBuilder: FormBuilder,) {
  }

  ngOnInit() {
    this.dynamicForm = this.formBuilder.group({});

    // Dynamically add form controls based on properties
    this.properties.forEach((property: any) => {
      const validators = [];
      if (property.isRequired) {
        validators.push(Validators.required);
      }
      this.dynamicForm.addControl(property.id, this.formBuilder.control(property.id, validators));
    });
  }

  onSubmit() {

  }
}
