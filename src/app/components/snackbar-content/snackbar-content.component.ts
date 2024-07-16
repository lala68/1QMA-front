import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar-content',
  template: `
    <div>
      <div class="font-size-16 weight-700 title">{{ data.title }}</div>
      <div class="font-size-14 weight-400">{{ data.message }}</div>
    </div>
  `,
  styles: [``]
})
export class SnackbarContentComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
  }
}
