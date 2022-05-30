import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrderCredentialFormComponent } from './edit-order-credential-form.component';

describe('EditOrderCredentialFormComponent', () => {
  let component: EditOrderCredentialFormComponent;
  let fixture: ComponentFixture<EditOrderCredentialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditOrderCredentialFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOrderCredentialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
