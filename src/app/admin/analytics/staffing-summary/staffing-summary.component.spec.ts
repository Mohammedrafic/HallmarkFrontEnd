import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffingSummaryComponent } from './staffing-summary.component';

describe('StaffingSummaryComponent', () => {
  let component: StaffingSummaryComponent;
  let fixture: ComponentFixture<StaffingSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffingSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
