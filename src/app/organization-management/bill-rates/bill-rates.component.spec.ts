import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillRatesComponent } from './bill-rates.component';

describe('BillRatesComponent', () => {
  let component: BillRatesComponent;
  let fixture: ComponentFixture<BillRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillRatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
