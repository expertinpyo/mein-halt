import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LocationDetail, LocationDetailMap } from '@app/models/data.model';
import { RemainingTimePipe } from '@app/pipes/remaining-time-pipe';
import { map, Observable, startWith, Subject, takeUntil, timer } from 'rxjs';


@Component({
  selector: 'app-station-board',
  imports: [CommonModule, ReactiveFormsModule, RemainingTimePipe],
  templateUrl: './station-board.html',
  styleUrl: './station-board.scss'
})
export class StationBoard implements OnInit, OnDestroy{
  currentTime$: Observable<Date> = timer(0, 1000).pipe(map(()=> new Date()));
  autoSearchControl = new FormControl(false);

  @Input() stationDetails: LocationDetailMap[] | null = [];
  @Output() autoSearchToggle = new EventEmitter<boolean>();

  private destroy$ = new Subject<void> ();

  ngOnInit(): void {
    this.autoSearchControl.valueChanges.pipe(
      startWith(false),
      takeUntil(this.destroy$)
    ).subscribe(isEnable => {
      this.autoSearchToggle.emit(isEnable ?? false);
    })
  }


  isDelayed(detail: LocationDetail): string {
    if(detail.ttTime >= detail.etTime)
      return 'ontime'
    return 'delayed'
  }

  getRemainingTimeClass(etTime: string, now:Date): string{
    const etTimeC = new Date(etTime);
    const diffInMinutes = Math.floor((etTimeC.getTime() - now.getTime())/60000)
    if (diffInMinutes < 0) return 'departed';
    if (diffInMinutes <= 1) return 'imminent';
    return '';
  }

  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
