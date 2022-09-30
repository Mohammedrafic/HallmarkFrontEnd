import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentManagementComponent } from './document-management.component';

describe('DocumentManagementComponent', () => {
  let component: DocumentManagementComponent;
  let fixture: ComponentFixture<DocumentManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
