import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogInterfaceComponent } from './log-interface.component';

describe('LogInterfaceComponent', () => {
  let component: LogInterfaceComponent;
  let fixture: ComponentFixture<LogInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogInterfaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
