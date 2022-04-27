import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDetailsGroupComponent } from './contact-details-group.component';

describe('ContactDetailsGroupComponent', () => {
  let component: ContactDetailsGroupComponent;
  let fixture: ComponentFixture<ContactDetailsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactDetailsGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactDetailsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
