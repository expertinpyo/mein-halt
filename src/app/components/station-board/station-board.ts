import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LocationDetail } from '@app/models/data.model';
import { RemainingTimePipe } from '@app/pipes/remaining-time-pipe';
import { map, Observable, timer } from 'rxjs';


@Component({
  selector: 'app-station-board',
  imports: [CommonModule, RemainingTimePipe],
  templateUrl: './station-board.html',
  styleUrl: './station-board.scss'
})
export class StationBoard {
  currentTime$: Observable<Date> = timer(0, 1000).pipe(map(()=> new Date()));

  @Input() stationDetails: LocationDetail[] | null = [];

  isDelayed(detail: LocationDetail): string {
    if(detail.ttTime >= detail.etTime)
      return 'ontime'
    return 'delayed'
  }

  getRemainingTimeClass(etTime: string, now:Date): string{
    const etTimeC = new Date(etTime);
    const diffInMinutes = Math.floor((etTimeC.getTime() - now.getTime())/60000)
    if (diffInMinutes <= 0) return 'departed';
    if (diffInMinutes < 1) return 'imminent';
    return '';
  }
}
