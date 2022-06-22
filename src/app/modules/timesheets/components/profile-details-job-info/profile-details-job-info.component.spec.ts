import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDetailsJobInfoComponent } from './profile-details-job-info.component';

describe('ProfileDetailsJobInfoComponent', () => {
  let component: ProfileDetailsJobInfoComponent;
  let fixture: ComponentFixture<ProfileDetailsJobInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileDetailsJobInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDetailsJobInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
