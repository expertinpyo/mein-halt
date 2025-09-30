import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOptions } from './select-options';

describe('SelectOptions', () => {
  let component: SelectOptions;
  let fixture: ComponentFixture<SelectOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
