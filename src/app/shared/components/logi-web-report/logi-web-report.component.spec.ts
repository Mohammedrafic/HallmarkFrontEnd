import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogiWebReportComponent } from './logi-web-report.component';

describe('LogiWebReportComponent', () => {
  let component: LogiWebReportComponent;
  let fixture: ComponentFixture<LogiWebReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogiWebReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogiWebReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
