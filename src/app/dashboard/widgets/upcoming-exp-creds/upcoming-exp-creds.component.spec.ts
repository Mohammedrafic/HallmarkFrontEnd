import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingExpCredsComponent } from './upcoming-exp-creds.component';

describe('UpcomingExpCredsComponent', () => {
  let component: UpcomingExpCredsComponent;
  let fixture: ComponentFixture<UpcomingExpCredsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingExpCredsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingExpCredsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
