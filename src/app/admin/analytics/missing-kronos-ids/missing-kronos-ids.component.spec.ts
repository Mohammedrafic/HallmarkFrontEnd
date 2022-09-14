import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingKronosIdsComponent } from './missing-kronos-ids.component';

describe('MissingKronosIdsComponent', () => {
  let component: MissingKronosIdsComponent;
  let fixture: ComponentFixture<MissingKronosIdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissingKronosIdsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissingKronosIdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
