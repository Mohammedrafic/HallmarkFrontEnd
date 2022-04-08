import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsContentComponent } from './timesheets-content.component';

describe('TimesheetsContentComponent', () => {
  let component: TimesheetsContentComponent;
  let fixture: ComponentFixture<TimesheetsContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetsContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
