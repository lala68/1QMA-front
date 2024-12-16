import { TwoDecimalPipe } from './two-decimal.pipe';

describe('TwoDecimalPipe', () => {
  it('create an instance', () => {
    const pipe = new TwoDecimalPipe();
    expect(pipe).toBeTruthy();
  });
});
