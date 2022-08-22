import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterChipListComponent } from './filter-chip-list.component';

describe('FilterChipListComponent', () => {
  let component: FilterChipListComponent;
  let fixture: ComponentFixture<FilterChipListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterChipListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterChipListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
