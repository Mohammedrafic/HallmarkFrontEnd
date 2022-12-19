import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderImportComponent } from './order-import.component';

describe('OrderImportComponent', () => {
  let component: OrderImportComponent;
  let fixture: ComponentFixture<OrderImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
