import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalBillRateComponent } from './external-bill-rate.component';

describe('ExternalBillRateComponent', () => {
  let component: ExternalBillRateComponent;
  let fixture: ComponentFixture<ExternalBillRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternalBillRateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalBillRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
