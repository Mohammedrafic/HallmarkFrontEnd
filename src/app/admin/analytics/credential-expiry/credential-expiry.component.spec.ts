import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialExpiryComponent } from './credential-expiry.component';

describe('CredentialExpiryComponent', () => {
  let component: CredentialExpiryComponent;
  let fixture: ComponentFixture<CredentialExpiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CredentialExpiryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CredentialExpiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
