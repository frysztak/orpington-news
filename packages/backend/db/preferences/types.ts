import { Type } from '@sinclair/typebox';

export const ViewPreferenceCodec = Type.Union([
  Type.Object({ activeView: Type.Literal('home') }),
  Type.Object({
    activeView: Type.Literal('collection'),
    activeCollectionId: Type.Integer(),
  }),
]);
