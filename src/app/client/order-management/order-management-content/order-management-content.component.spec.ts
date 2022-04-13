import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderManagementContentComponent } from './order-management-content.component';

describe('OrderManagementContentComponent', () => {
  let component: OrderManagementContentComponent;
  let fixture: ComponentFixture<OrderManagementContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderManagementContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderManagementContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
