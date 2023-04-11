import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrantReportComponent } from './grant-report.component';

describe('GrantReportComponent', () => {
  let component: GrantReportComponent;
  let fixture: ComponentFixture<GrantReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrantReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrantReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
