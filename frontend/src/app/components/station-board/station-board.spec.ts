import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StationBoard } from './station-board';

describe('StationBoard', () => {
  let component: StationBoard;
  let fixture: ComponentFixture<StationBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StationBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
