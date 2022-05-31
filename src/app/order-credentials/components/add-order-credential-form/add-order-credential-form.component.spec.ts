import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrderCredentialFormComponent } from './add-order-credential-form.component';

describe('AddOrderCredentialFormComponent', () => {
  let component: AddOrderCredentialFormComponent;
  let fixture: ComponentFixture<AddOrderCredentialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOrderCredentialFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrderCredentialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
