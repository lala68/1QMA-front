import {Pipe, PipeTransform} from '@angular/core';
import jalaliMoment from 'jalali-moment';

@Pipe({
  name: 'shamsiDate',
  standalone: true
})
export class ShamsiDatePipe implements PipeTransform {
  transform(miladiDate: string | Date): string {
    if (!miladiDate) {
      return '';
    }

    const miladiMoment = jalaliMoment(miladiDate);
    const shamsiDate = miladiMoment.format('jYYYY/jM/jD');

    return shamsiDate || '';
  }
}

