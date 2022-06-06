import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditVisibilityComponent } from './add-edit-visibility.component';

describe('AddEditVisibilityComponent', () => {
  let component: AddEditVisibilityComponent;
  let fixture: ComponentFixture<AddEditVisibilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditVisibilityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditVisibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
