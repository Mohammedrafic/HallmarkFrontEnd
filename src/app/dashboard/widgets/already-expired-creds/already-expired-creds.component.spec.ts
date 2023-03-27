import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlreadyExpiredCredsComponent } from './already-expired-creds.component';

describe('AlreadyExpiredCredsComponent', () => {
  let component: AlreadyExpiredCredsComponent;
  let fixture: ComponentFixture<AlreadyExpiredCredsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlreadyExpiredCredsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlreadyExpiredCredsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
