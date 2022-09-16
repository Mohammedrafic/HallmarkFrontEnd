import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YtdReportComponent } from './ytd-report.component';

describe('YtdReportComponent', () => {
  let component: YtdReportComponent;
  let fixture: ComponentFixture<YtdReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YtdReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YtdReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
