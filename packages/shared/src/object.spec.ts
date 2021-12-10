import { omitBy } from './object';

describe('object', () => {
  describe('omitBy', () => {
    it('works for empty obj', () => {
      const omit = omitBy((x) => true);
      expect(omit({})).toStrictEqual({});
    });

    it('skips keys that satisfy predicate', () => {
      const omit = omitBy((x) => x.includes('_'));
      expect(
        omit({
          a: true,
          a_b: 2,
          b: false,
        })
      ).toStrictEqual({
        a: true,
        b: false,
      });
    });
  });
});
