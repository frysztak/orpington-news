import { inhibitUntilArgsChanged } from './inhibitUntilArgsChanged';

describe('inhibitUntilArgsChanged', () => {
  it('calls func when called first time', () => {
    const func = jest.fn(() => {});
    const funk = inhibitUntilArgsChanged(func);

    funk();

    expect(func).toBeCalledTimes(1);
  });

  it('calls func once when args remain the same', () => {
    const func = jest.fn(() => {});
    const funk = inhibitUntilArgsChanged(func);

    funk();
    funk();
    funk();

    expect(func).toBeCalledTimes(1);
  });

  it('passes args to func', () => {
    const func = jest.fn((arg1: boolean, args2: string) => {});
    const funk = inhibitUntilArgsChanged(func);

    funk(true, 'hello');
    funk(true, 'hello');
    funk(true, 'hello');

    expect(func).toBeCalledTimes(1);
    expect(func).toBeCalledWith(true, 'hello');
  });
});
