export type MockUserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
};

/** Akun dummy — sama dengan seed BE untuk uji lintas environment. */
export const mockUsers: MockUserRecord[] = [
  {
    id: 'usr-admin',
    name: 'Admin Demo',
    email: 'admin@mail.com',
    password: 'admin12345',
    role: 'ADMIN',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-customer',
    name: 'User Demo',
    email: 'user@mail.com',
    password: 'user12345',
    role: 'CUSTOMER',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-customer-2',
    name: 'Budi Mahasiswa',
    email: 'budi@mail.com',
    password: 'user12345',
    role: 'CUSTOMER',
    createdAt: '2025-02-01T00:00:00.000Z',
  },
];

export function findMockUserByCredentials(email: string, password: string) {
  return mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
}

export function parseMockToken(token: string | null | undefined): MockUserRecord | null {
  if (!token || !token.startsWith('mock.')) return null;
  const userId = token.split('.')[1];
  return mockUsers.find((u) => u.id === userId) ?? null;
}

export function createMockAccessToken(userId: string) {
  return `mock.${userId}.dev`;
}
