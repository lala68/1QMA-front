import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'twoDecimal',
  standalone: true
})

export class TwoDecimalPipe implements PipeTransform {
  transform(value: number | string): string {
    if (isNaN(Number(value))) {
      return value.toString(); // Return as is if not a valid number
    }
    return Number(value).toFixed(2);
  }
}
