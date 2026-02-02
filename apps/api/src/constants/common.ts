

// TODO: Refactor this such that it is easy to add new error and more intuitive

export const POSTGRES_ERR = {
  employees_employeeNumber_unique: 'employees_employee_number_unique',
  employees_userId_unique: 'employees_user_id_unique',
  employees_userId_fkey: 'employees_user_id_user_id_fk',
} as const;

export const EXPLORER_ROUTE = '/queue-explorer';