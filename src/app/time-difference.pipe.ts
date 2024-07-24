import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'timeDifference',
  standalone: true
})
export class TimeDifferencePipe implements PipeTransform {

  transform(startedAt: string, endedAt: string): string {
    const startDate = new Date(startedAt);
    const endDate = new Date(endedAt);

    const differenceInMs = endDate.getTime() - startDate.getTime();
    const differenceInSeconds = Math.floor(differenceInMs / 1000);
    const differenceInMinutes = Math.floor(differenceInSeconds / 60);
    const remainingSeconds = differenceInSeconds % 60;

    // return `${differenceInMinutes} minutes and ${remainingSeconds} seconds`;
    return `${differenceInMinutes} : ${remainingSeconds}`;
  }

}
