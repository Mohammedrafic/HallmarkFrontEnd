import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientManagementContentComponent } from './client-management-content.component';

describe('ClientManagementContentComponent', () => {
  let component: ClientManagementContentComponent;
  let fixture: ComponentFixture<ClientManagementContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientManagementContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientManagementContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
