import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms'; 
import { debounce, debounceTime, distinctUntilChanged, filter, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { LocationOption } from '@app/models/data.model';
import { ApiService } from '@app/core/api.service';
import { CommonModule } from '@angular/common';

export interface DisplayLocationOption {
  item : LocationOption;
  isFav: boolean;
}

@Component({
  selector: 'app-select-options',
  imports: [ReactiveFormsModule, CommonModule ],
  templateUrl: './select-options.html',
  styleUrl: './select-options.scss'
})
export class SelectOptions implements OnInit, OnDestroy{
  // Location List by API 
  @Input() locationOptionsDisply: DisplayLocationOption[] | null = [];

  // Emit Location Options Search event to Parent component
  @Output() locationOptionsSearch = new EventEmitter<string>();

  // Emit Detail Search event to Parent component
  @Output() detailSearch = new EventEmitter<LocationOption>();

  // Emit toggle Favorite event to Parent component
  @Output() toggleFavorite = new EventEmitter<LocationOption>();
  
  // input value Form Control Value
  searchControl = new FormControl('');

  // Selected Location Item 
  selectedItem: LocationOption | null = null; 

  // destoryer Object - Prevent Memory leaks
  private destory$ = new Subject<void> ();

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      // filter(term => !!term && term.length > 1),
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destory$)
    ).subscribe(term=> {
      console.log('1. [CHILD]: Debounced term. Emitting to parent ->', term);
      this.locationOptionsSearch.emit(term || '')
    })
  }

  onSearchClick(): void {
    if(this.searchControl.value && this.selectedItem) {
      console.log('Search Detail Informatin : ', this.selectedItem.name)
      this.detailSearch.emit(this.selectedItem)
    }
  }

  onItemSelect(location: LocationOption): void {
    console.log('Item Clicked : ', location);
    this.selectedItem = location
    this.searchControl.setValue(location.name, { emitEvent: false})
  }

  toggleFav(location: LocationOption, event: MouseEvent): void {
    event.stopPropagation();
    this.toggleFavorite.emit(location);
  }

  isSearchPossible(): boolean {
    if(this.searchControl.value?.trim() && this.selectedItem)
      return true;
    return false
  }
  
  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}
