export const ContractErrors: Record<number, string> = {
  1: 'You are not the campaign owner',
  2: 'Campaign does not exist',
  3: 'Goal not reached or no contribution',
  4: 'Campaign already expired',
  5: 'Campaign inactive',
  6: 'Goal must be greater than 0',
  7: 'Contribution must be greater than 0',
};

export const getContractErrorMessage = (errorCode: number | string): string => {
  const code = typeof errorCode === 'string' ? parseInt(errorCode, 10) : errorCode;
  return ContractErrors[code] || 'An unknown contract error occurred';
};
