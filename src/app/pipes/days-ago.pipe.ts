import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Pipe({
  name: 'daysAgo',
  standalone: true
})
export class DaysAgoPipe implements PipeTransform {

  constructor(private translate: TranslateService) {
  }

  transform(value: string): string {
    if (!value) return 'No date provided';

    const date = new Date(value);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());

    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      if (diffHours === 0) return this.translate.instant('Just now');
      if (diffHours === 1) return `1` + this.translate.instant('hour ago');
      return `${diffHours} ` + this.translate.instant('hour ago');
    }

    if (diffDays === 1) return `1` + this.translate.instant('day ago');
    return `${diffDays} ` + this.translate.instant('days ago');
  }
}
