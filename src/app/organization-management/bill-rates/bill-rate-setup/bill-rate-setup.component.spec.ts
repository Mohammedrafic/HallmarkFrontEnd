import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillRateSetupComponent } from './bill-rate-setup.component';

describe('BillRateSetupComponent', () => {
  let component: BillRateSetupComponent;
  let fixture: ComponentFixture<BillRateSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillRateSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillRateSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
