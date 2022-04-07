import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientManagementContentComponent } from './client-management-content.component';

describe('OrderManagementContentComponent', () => {
  let component: ClientManagementContentComponent;
  let fixture: ComponentFixture<ClientManagementContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientManagementContentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientManagementContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
