import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillRateTypeComponent } from './bill-rate-type.component';

describe('BillRateTypeComponent', () => {
  let component: BillRateTypeComponent;
  let fixture: ComponentFixture<BillRateTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillRateTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillRateTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
