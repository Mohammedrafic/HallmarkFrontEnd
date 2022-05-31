import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditOrderComponent } from './add-edit-order.component';

describe('AddEditOrderComponent', () => {
  let component: AddEditOrderComponent;
  let fixture: ComponentFixture<AddEditOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
