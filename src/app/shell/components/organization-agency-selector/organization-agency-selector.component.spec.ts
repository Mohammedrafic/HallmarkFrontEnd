import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAgencySelectorComponent } from './organization-agency-selector.component';

describe('OrganizationAgencySelectorComponent', () => {
  let component: OrganizationAgencySelectorComponent;
  let fixture: ComponentFixture<OrganizationAgencySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationAgencySelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationAgencySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
