import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayRateComponent } from './pay-rate.component';

describe('PayRateComponent', () => {
  let component: PayRateComponent;
  let fixture: ComponentFixture<PayRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayRateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
