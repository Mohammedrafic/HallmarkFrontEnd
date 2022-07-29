import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentageRatioIndicatorComponent } from './percentage-ratio-indicator.component';

describe('PercentageRatioIndicatorComponent', () => {
  let component: PercentageRatioIndicatorComponent;
  let fixture: ComponentFixture<PercentageRatioIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PercentageRatioIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentageRatioIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
