import { Static, Type } from '@sinclair/typebox';
import { sql, TaggedTemplateLiteralInvocation } from 'slonik';

export const PaginationSchema = Type.Object({
  pageSize: Type.Optional(Type.Integer()),
  pageIndex: Type.Optional(Type.Integer()),
});
export type PaginationParams = Static<typeof PaginationSchema>;

export const addPagination = <TResult>(
  paginationParams: PaginationParams,
  query: TaggedTemplateLiteralInvocation<TResult>
) => {
  const { pageIndex = 0, pageSize = 20 } = paginationParams;
  const offset = pageIndex * pageSize;

  return sql`${query} LIMIT ${pageSize} OFFSET ${offset}`;
};
