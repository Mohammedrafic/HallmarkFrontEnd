import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileUploadsComponent } from './profile-uploads.component';

describe('ProfileUploadsComponent', () => {
  let component: ProfileUploadsComponent;
  let fixture: ComponentFixture<ProfileUploadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileUploadsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileUploadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
