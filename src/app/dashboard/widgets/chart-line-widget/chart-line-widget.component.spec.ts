import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartLineWidgetComponent } from './chart-line-widget.component';

describe('SimpleChartWidgetComponent', () => {
  let component: ChartLineWidgetComponent;
  let fixture: ComponentFixture<ChartLineWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartLineWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartLineWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
