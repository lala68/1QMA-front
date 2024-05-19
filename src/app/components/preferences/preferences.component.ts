import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {AuthService} from "../../services/auth/auth.service";
import {Preferences} from "@capacitor/preferences";

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, TranslateModule],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss'
})
export class PreferencesComponent {
  @Input() stepper: any;
  selectedCategory: any = [];
  error: any;
  loading: boolean = false;

  constructor(public generalService: GeneralService, public authService: AuthService) {
    if (this.generalService?.userObj?.preferedCategories) {
      this.selectedCategory = this.generalService?.userObj?.preferedCategories;
    }
  }

  selectCat(item: any) {
    const index = this.selectedCategory.indexOf(item);

    if (index >= 0) {
      this.selectedCategory.splice(index, 1);
    } else {
      this.selectedCategory.push(item);
    }
  }

  submit() {
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
}
