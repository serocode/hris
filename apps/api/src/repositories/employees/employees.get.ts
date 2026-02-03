import { eq } from 'drizzle-orm';
import { db } from '@/lib/database';
import { type EmployeeRecord, employees } from '@/schema/employees';

export const getEmployeeById = async (id: string): Promise<EmployeeRecord | null> => {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id))
    .limit(1);

  return employee || null;
};

export const getEmployeeByEmployeeNumber = async (employeeNumber: string): Promise<EmployeeRecord | null> => {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.employeeNumber, employeeNumber))
    .limit(1);

  return employee || null;
};

export const getEmployeeByUserId = async (userId: string): Promise<EmployeeRecord | null> => {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId))
    .limit(1);

  return employee || null;
};
