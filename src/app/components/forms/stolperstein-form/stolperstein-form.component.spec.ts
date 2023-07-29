import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StolpersteinFormComponent } from './stolperstein-form.component';

describe('StolpersteinFormComponent', () => {
  let component: StolpersteinFormComponent;
  let fixture: ComponentFixture<StolpersteinFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StolpersteinFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StolpersteinFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
