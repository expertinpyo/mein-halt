import { Component, inject, Input, input, OnInit } from '@angular/core';
import { SelectOptions, DisplayLocationOption } from '../select-options/select-options';
import { StationBoard } from '../station-board/station-board';
import { ApiService } from '@app/core/api.service';
import { LocationOption, LocationDetail, LocationDetailMap } from '@app/models/data.model';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, startWith, Subject, switchMap, tap, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FavoritesService } from '@app/core/favorites.service';

@Component({
  selector: 'app-home',
  imports: [SelectOptions, StationBoard, CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{
  apiService = inject(ApiService);
  favService = inject(FavoritesService);

  private searchLocatioTr = new Subject<string>();
  private searchDetailTr = new Subject<LocationOption>();
  private autoSearchTrigger = new Subject<boolean>();

  private favSubject = new BehaviorSubject<LocationOption[]>([]);
  favorites$ = this.favSubject.asObservable(); // Read only Observable Object
  
  autoSearch = new FormControl(false);

  locationOptions$! : Observable<LocationOption[]>;
  locationDetail$! : Observable<LocationDetailMap[]>;

  locationOptionsDisplay$! : Observable<DisplayLocationOption[]>;

  lastUpdated: Date | null = null;

  ngOnInit(): void {
    this.loadFavorites();

    this.locationOptions$ = this.searchLocatioTr.pipe(
      startWith(''),
      switchMap(term => this.apiService.getLocationOptions(term).pipe(
        catchError(err=> {
        console.log("Error : ", err);
        return of([])
      })
      ))
    );

    this.locationOptionsDisplay$ = combineLatest([
      this.locationOptions$, 
      this.favorites$
    ]).pipe(
      map(([opts, favs]) => {
        const favItems = favs.map(fav => ({item: fav, isFav: true}))
        const notFavItems = opts
          .filter(opt=> !favs.some(fav => fav.stopPlaceRef === opt.stopPlaceRef))
          .map(opt=> ({
            item: opt,
            isFav:false
          }))
        return [...favItems, ...notFavItems]
        }
      )
    );

    this.locationDetail$  = combineLatest([
      this.searchDetailTr,
      this.autoSearchTrigger
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
    tap(()=> {
      this.lastUpdated = new Date()
      console.log('New Update Time : ', this.lastUpdated);
    })
  }

  onSearchLocationOptions(str : string): void {
    console.log('Parent Recieved string : ', str);
    this.searchLocatioTr.next(str);
  }

  onSearchDetail(location : LocationOption): void {
    console.log('Parent Recieved Location : ', location.name);
    this.searchDetailTr.next(location);
  }

  onAutoSearchToggle(toggle: boolean): void {
    this.autoSearchTrigger.next(toggle)
  }

  onFavToggleClicked(location: LocationOption): void {
    console.log('Fav button clicked');
    if(this.favService.isFavorite(location.stopPlaceRef)) {
      this.favService.removeFavorites(location.stopPlaceRef)
    } else {
      this.favService.addFavorites(location)
    }
    this.loadFavorites();
  }

  loadFavorites(): void{
    this.favSubject.next(this.favService.getFavorites());
  }
}
