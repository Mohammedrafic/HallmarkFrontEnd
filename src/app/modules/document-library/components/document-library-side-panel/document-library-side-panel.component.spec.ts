import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentLibrarySidePanelComponent } from './document-library-side-panel.component';

describe('DocumentLibrarySidePanelComponent', () => {
  let component: DocumentLibrarySidePanelComponent;
  let fixture: ComponentFixture<DocumentLibrarySidePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentLibrarySidePanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLibrarySidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
