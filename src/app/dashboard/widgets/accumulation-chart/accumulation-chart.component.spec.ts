import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccumulationChartComponent } from './accumulation-chart.component';

describe('AccumulationChartComponent', () => {
  let component: AccumulationChartComponent;
  let fixture: ComponentFixture<AccumulationChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccumulationChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccumulationChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
