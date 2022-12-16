import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditReorderComponent } from './add-edit-reorder.component';

describe('AddEditReorderComponent', () => {
  let component: AddEditReorderComponent;
  let fixture: ComponentFixture<AddEditReorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddEditReorderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditReorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
