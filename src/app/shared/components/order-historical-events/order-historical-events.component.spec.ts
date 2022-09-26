import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderHistoricalEventsComponent } from './order-historical-events.component';

describe('OrderHistoricalEventsComponent', () => {
  let component: OrderHistoricalEventsComponent;
  let fixture: ComponentFixture<OrderHistoricalEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderHistoricalEventsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderHistoricalEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
