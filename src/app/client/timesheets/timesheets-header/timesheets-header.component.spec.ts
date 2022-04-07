import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsHeaderComponent } from './timesheets-header.component';

describe('TimesheetsHeaderComponent', () => {
  let component: TimesheetsHeaderComponent;
  let fixture: ComponentFixture<TimesheetsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetsHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
