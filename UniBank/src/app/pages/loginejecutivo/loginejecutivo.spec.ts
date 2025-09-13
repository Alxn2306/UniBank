import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loginejecutivo } from './loginejecutivo';

describe('Loginejecutivo', () => {
  let component: Loginejecutivo;
  let fixture: ComponentFixture<Loginejecutivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loginejecutivo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loginejecutivo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
