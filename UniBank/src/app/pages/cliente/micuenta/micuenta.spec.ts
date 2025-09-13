import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Micuenta } from './micuenta';

describe('Micuenta', () => {
  let component: Micuenta;
  let fixture: ComponentFixture<Micuenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Micuenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Micuenta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
