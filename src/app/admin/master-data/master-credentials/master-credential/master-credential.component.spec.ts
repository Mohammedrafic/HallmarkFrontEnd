import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterCredentialComponent } from './master-credential.component';

describe('CredentialComponent', () => {
  let component: MasterCredentialComponent;
  let fixture: ComponentFixture<MasterCredentialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterCredentialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterCredentialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
