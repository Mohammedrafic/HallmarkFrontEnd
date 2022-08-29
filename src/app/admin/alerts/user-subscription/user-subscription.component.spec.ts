import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSubscriptionComponent } from './user-subscription.component';

describe('UserSubscriptionComponent', () => {
  let component: UserSubscriptionComponent;
  let fixture: ComponentFixture<UserSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSubscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
