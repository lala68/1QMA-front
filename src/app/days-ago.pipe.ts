import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysAgo',
  standalone: true
})
export class DaysAgoPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return 'No date provided';

    const date = new Date(value);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }

}
