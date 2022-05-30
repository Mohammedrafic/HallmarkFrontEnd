import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCredentialsComponent } from './order-credentials.component';

describe('OrderCredentialsComponent', () => {
  let component: OrderCredentialsComponent;
  let fixture: ComponentFixture<OrderCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderCredentialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
