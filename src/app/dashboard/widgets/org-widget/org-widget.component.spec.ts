import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgWidgetComponent } from './org-widget.component';

describe('OrgWidgetComponent', () => {
  let component: OrgWidgetComponent;
  let fixture: ComponentFixture<OrgWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
