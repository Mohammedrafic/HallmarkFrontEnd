import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCredentialsGridComponent } from './order-credentials-grid.component';

describe('OrderCredentialsGridComponent', () => {
  let component: OrderCredentialsGridComponent;
  let fixture: ComponentFixture<OrderCredentialsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderCredentialsGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCredentialsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
