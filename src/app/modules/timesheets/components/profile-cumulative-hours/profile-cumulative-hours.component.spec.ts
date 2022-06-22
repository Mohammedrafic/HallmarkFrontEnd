import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCumulativeHoursComponent } from './profile-cumulative-hours.component';

describe('ProfileCumulativeHoursComponent', () => {
  let component: ProfileCumulativeHoursComponent;
  let fixture: ComponentFixture<ProfileCumulativeHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileCumulativeHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileCumulativeHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
