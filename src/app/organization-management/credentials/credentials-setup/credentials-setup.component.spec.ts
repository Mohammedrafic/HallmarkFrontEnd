import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialsSetupComponent } from './credentials-setup.component';

describe('CredentialsSetupComponent', () => {
  let component: CredentialsSetupComponent;
  let fixture: ComponentFixture<CredentialsSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CredentialsSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CredentialsSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
