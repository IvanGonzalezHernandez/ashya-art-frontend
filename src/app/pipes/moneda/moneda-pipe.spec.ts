// src/app/pipes/moneda/moneda-pipe.spec.ts
import { MonedaPipe } from './moneda-pipe';

describe('MonedaPipe', () => {
  it('should create an instance', () => {
    const pipe = new MonedaPipe(null as any);
    expect(pipe).toBeTruthy();
  });
});
