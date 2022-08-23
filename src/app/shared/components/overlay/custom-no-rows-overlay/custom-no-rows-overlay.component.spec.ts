import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomNoRowsOverlayComponent } from './custom-no-rows-overlay.component';

describe('CustomNoRowsOverlayComponent', () => {
  let component: CustomNoRowsOverlayComponent;
  let fixture: ComponentFixture<CustomNoRowsOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomNoRowsOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomNoRowsOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
