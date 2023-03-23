import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RnUtilizationWidgetComponent } from './rn-utilization-widget.component';

describe('RnUtilizationWidgetComponent', () => {
  let component: RnUtilizationWidgetComponent;
  let fixture: ComponentFixture<RnUtilizationWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RnUtilizationWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RnUtilizationWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
