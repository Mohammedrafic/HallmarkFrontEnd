import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCredentialsFormComponent } from './order-credentials-form.component';

describe('OrderCredentialsFormComponent', () => {
  let component: OrderCredentialsFormComponent;
  let fixture: ComponentFixture<OrderCredentialsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderCredentialsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCredentialsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
