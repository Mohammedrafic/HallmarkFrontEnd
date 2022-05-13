import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterHolidaysComponent } from './holidays.component';

describe('MasterHolidaysComponent', () => {
  let component: MasterHolidaysComponent;
  let fixture: ComponentFixture<MasterHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterHolidaysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
