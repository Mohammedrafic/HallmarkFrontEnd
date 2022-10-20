import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderMatchColumnComponent } from './order-match-column.component';

describe('OrderMatchColumnComponent', () => {
  let component: OrderMatchColumnComponent;
  let fixture: ComponentFixture<OrderMatchColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderMatchColumnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderMatchColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
