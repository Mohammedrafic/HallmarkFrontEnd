import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientManagementHeaderComponent } from './client-management-header.component';

describe('OrderManagementHeaderComponent', () => {
  let component: ClientManagementHeaderComponent;
  let fixture: ComponentFixture<ClientManagementHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientManagementHeaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientManagementHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
