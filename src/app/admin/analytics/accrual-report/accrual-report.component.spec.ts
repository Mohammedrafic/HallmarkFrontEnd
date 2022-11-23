import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccrualReportComponent } from './accrual-report.component';

describe('AccrualReportComponent', () => {
  let component: AccrualReportComponent;
  let fixture: ComponentFixture<AccrualReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccrualReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccrualReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
