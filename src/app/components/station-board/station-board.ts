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

  @Input() departures: LocationDetail[] | null = [];

  isDelayed(departure: LocationDetail): boolean {
    return departure.ttTime !== departure.etTime
  }

  getRemainingTimeClass(etTime: string, now:Date): string{
    const etTimeC = new Date(etTime);
    const diffInMinutes = Math.floor((etTimeC.getTime() - now.getTime())/60000)
    if (diffInMinutes <= 0) return 'departed';
    if (diffInMinutes < 1) return 'imminent';
    return '';
  }
}
