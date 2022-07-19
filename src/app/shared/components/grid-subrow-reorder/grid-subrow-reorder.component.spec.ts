import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridSubrowReorderComponent } from './grid-subrow-reorder.component';

describe('GridSubrowReorderComponent', () => {
  let component: GridSubrowReorderComponent;
  let fixture: ComponentFixture<GridSubrowReorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridSubrowReorderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridSubrowReorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
