import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAgencyComponent } from './add-edit-agency.component';

describe('AddEditAgencyComponent', () => {
  let component: AddEditAgencyComponent;
  let fixture: ComponentFixture<AddEditAgencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditAgencyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
