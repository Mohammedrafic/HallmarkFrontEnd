import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsChartComponent } from './maps-chart.component';

describe('MapsChartComponent', () => {
  let component: MapsChartComponent;
  let fixture: ComponentFixture<MapsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
