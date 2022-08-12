import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionGridIdRendererComponent } from './extension-grid-id-renderer.component';

describe('ExtensionGridIdRendererComponent', () => {
  let component: ExtensionGridIdRendererComponent;
  let fixture: ComponentFixture<ExtensionGridIdRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExtensionGridIdRendererComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionGridIdRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
