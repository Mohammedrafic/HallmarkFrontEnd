import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillRatesGridComponent } from './bill-rates-grid.component';

describe('BillRatesGridComponent', () => {
  let component: BillRatesGridComponent;
  let fixture: ComponentFixture<BillRatesGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillRatesGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillRatesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
