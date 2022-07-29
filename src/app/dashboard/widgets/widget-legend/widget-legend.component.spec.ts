import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetLegendComponent } from './widget-legend.component';

describe('WidgetLegendComponent', () => {
  let component: WidgetLegendComponent;
  let fixture: ComponentFixture<WidgetLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WidgetLegendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
