import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillRateFormComponent } from './bill-rate-form.component';

describe('BillRateFormComponent', () => {
  let component: BillRateFormComponent;
  let fixture: ComponentFixture<BillRateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillRateFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillRateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
