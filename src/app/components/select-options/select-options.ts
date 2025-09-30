import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms'; 
import { debounce, debounceTime, distinctUntilChanged, filter, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { LocationOption } from '@app/models/data.model';
import { ApiService } from '@app/core/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-options',
  imports: [ReactiveFormsModule, CommonModule ],
  templateUrl: './select-options.html',
  styleUrl: './select-options.scss'
})
export class SelectOptions implements OnInit, OnDestroy{
  @Input() locationOptions: LocationOption[] | null = [];
  @Output() searchLocationOptions = new EventEmitter<string>();
  @Output() searchDetailOutput = new EventEmitter<LocationOption>();
  
  searchControl = new FormControl('');
  private destory$ = new Subject<void> ();

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      // filter(term => !!term && term.length > 1),
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destory$)
    ).subscribe(term=> {
      console.log('1. [CHILD]: Debounced term. Emitting to parent ->', term);
      this.searchLocationOptions.emit(term || '')
    })
  }

  onSearch(location : LocationOption): void {
    console.log('On Search from Child Start : ', location)
    this.searchDetailOutput.emit(location)
  }  
  
  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}
