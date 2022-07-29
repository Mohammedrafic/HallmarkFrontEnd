import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogiReportComponent } from './logi-report.component';

describe('LogiReportComponent', () => {
  let component: LogiReportComponent;
  let fixture: ComponentFixture<LogiReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogiReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogiReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
