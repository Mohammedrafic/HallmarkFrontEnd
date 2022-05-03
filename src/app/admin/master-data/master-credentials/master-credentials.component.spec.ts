import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterCredentialsComponent } from './credentials.component';

describe('CredentialsComponent', () => {
  let component: MasterCredentialsComponent;
  let fixture: ComponentFixture<MasterCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterCredentialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
