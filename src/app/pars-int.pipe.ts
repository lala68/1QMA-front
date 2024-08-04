import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'parsInt',
  standalone: true
})
export class ParsIntPipe implements PipeTransform {

  transform(value: any): any {
    return parseInt(value);
  }

}
