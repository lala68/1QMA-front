import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, TranslateModule],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss'
})
export class PreferencesComponent {
  selectedCategory: any = [];

  constructor() {
  }

  selectCat(item: any) {
    const index = this.selectedCategory.indexOf(item);

    if (index >= 0) {
      this.selectedCategory.splice(index, 1);
    } else {
      this.selectedCategory.push(item);
    }
  }
}
