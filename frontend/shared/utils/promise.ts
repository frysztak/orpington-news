export const isRejected = <T>(
  result: PromiseSettledResult<T>
): result is PromiseRejectedResult => {
  return result.status === 'rejected';
};
