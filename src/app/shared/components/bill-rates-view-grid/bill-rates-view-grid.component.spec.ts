import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillRatesViewGridComponent } from './bill-rates-view-grid.component';

describe('BillRatesViewGridComponent', () => {
  let component: BillRatesViewGridComponent;
  let fixture: ComponentFixture<BillRatesViewGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillRatesViewGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillRatesViewGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
