import { db } from '@/lib/database';
import { type EmployeeRecord, employees } from '@/schema/employees';

export const list = async (limit = 100, offset = 0): Promise<EmployeeRecord[]> => {
  return db
    .select()
    .from(employees)
    .limit(limit)
    .offset(offset);
};
