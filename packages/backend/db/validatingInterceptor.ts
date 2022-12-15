import { Interceptor, QueryResultRow, SchemaValidationError } from 'slonik';

export const createResultParserInterceptor = (): Interceptor => {
  return {
    transformRow: (executionContext, actualQuery, row) => {
      const { resultParser } = executionContext;

      if (!resultParser) {
        return row;
      }

      const validationResult = resultParser.safeParse(row);

      if (!validationResult.success) {
        throw new SchemaValidationError(
          actualQuery,
          row as any,
          validationResult.error.issues
        );
      }

      return validationResult.data as QueryResultRow;
    },
  };
};
