import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'remainingTime',
  standalone: true
})
export class RemainingTimePipe implements PipeTransform {

  transform(etTime: string, crTime: Date): string {
    const etTimeC = new Date(etTime)
    const diffInMs = etTimeC.getTime() - crTime.getTime();
    const diffInMinutes = Math.floor(diffInMs/60000);

    if (diffInMinutes <  0) {
      return 'Angekommen';
    }

    if (diffInMinutes <= 1) {
      return 'Ankunft in Kürze';
    }
    
    return `In ${diffInMinutes} Minuten`;
  }

}
