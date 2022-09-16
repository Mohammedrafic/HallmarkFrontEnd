import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingCredentialsComponent } from './missing-credentials.component';

describe('MissingCredentialsComponent', () => {
  let component: MissingCredentialsComponent;
  let fixture: ComponentFixture<MissingCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissingCredentialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissingCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
