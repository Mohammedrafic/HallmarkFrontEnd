import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridErroredCellComponent } from './grid-errored-cell.component';

describe('GridErroredCellComponent', () => {
  let component: GridErroredCellComponent;
  let fixture: ComponentFixture<GridErroredCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridErroredCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridErroredCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
