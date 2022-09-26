import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportBillRatesComponent } from './import-bill-rates.component';

describe('ImportBillRatesComponent', () => {
  let component: ImportBillRatesComponent;
  let fixture: ComponentFixture<ImportBillRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportBillRatesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportBillRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
