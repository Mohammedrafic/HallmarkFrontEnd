import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationInvoiceComponent } from './organization-invoice.component';

describe('OrganizationInvoiceComponent', () => {
  let component: OrganizationInvoiceComponent;
  let fixture: ComponentFixture<OrganizationInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
