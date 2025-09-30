import { Component, inject, Input, input, OnInit } from '@angular/core';
import { SelectOptions } from '../select-options/select-options';
import { StationBoard } from '../station-board/station-board';
import { ApiService } from '@app/core/api.service';
import { LocationOption, LocationDetail } from '@app/models/data.model';
import { catchError, combineLatest, Observable, of, startWith, Subject, switchMap, tap, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [SelectOptions, StationBoard, CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{
  apiService = inject(ApiService);

  private searchLocatioTr = new Subject<string>();
  private searchDetailTr = new Subject<LocationOption>();
  
  autoSearch = new FormControl(false);

  locationOptions$! : Observable<LocationOption[]>;
  locationDetail$! : Observable<LocationDetail[]>;

  lastUpdated: Date | null = null;

  ngOnInit(): void {
    this.locationOptions$ = this.searchLocatioTr.pipe(
      startWith(''),
      switchMap(term => this.apiService.getLocationOptions(term)),
    );

    this.locationDetail$  = combineLatest([
      this.searchDetailTr,
      this.autoSearch.valueChanges.pipe(startWith(false))
    ]).pipe(
      switchMap(([item, isEnable])=>{
        if(isEnable){
          return timer(0, 15000).pipe(
            switchMap(()=> this.apiService.getStationTable(item))
          )
        }
        else {
          return this.apiService.getStationTable(item)
        }
      }
      
    )),
    tap(()=> this.lastUpdated = new Date())
  }

  onSearchClicked(str : string): void {
    console.log('Parent Recieved string : ', str);
    this.searchLocatioTr.next(str);
  }

  onSearchDetail(location : LocationOption): void {
    console.log('Parent Recieved Location : ', location.name);
    this.searchDetailTr.next(location);
  }
}
