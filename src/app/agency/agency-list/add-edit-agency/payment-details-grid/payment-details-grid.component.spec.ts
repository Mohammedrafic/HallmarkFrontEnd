import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDetailsGridComponent } from './payment-details-grid.component';

describe('PaymentDetailsGridComponent', () => {
  let component: PaymentDetailsGridComponent;
  let fixture: ComponentFixture<PaymentDetailsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentDetailsGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentDetailsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
