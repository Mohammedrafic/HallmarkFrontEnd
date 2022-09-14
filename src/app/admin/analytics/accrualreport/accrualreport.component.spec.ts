import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccrualreportComponent } from './accrualreport.component';

describe('AccrualreportComponent', () => {
  let component: AccrualreportComponent;
  let fixture: ComponentFixture<AccrualreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccrualreportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccrualreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
