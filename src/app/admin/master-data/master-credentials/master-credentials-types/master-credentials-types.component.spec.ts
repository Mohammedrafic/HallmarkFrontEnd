import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterCredentialsTypesComponent } from './credentials-types.component';

describe('CredentialTypesComponent', () => {
  let component: MasterCredentialsTypesComponent;
  let fixture: ComponentFixture<MasterCredentialsTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterCredentialsTypesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterCredentialsTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
