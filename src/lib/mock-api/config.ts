/** Aktifkan mock API lokal untuk development (tanpa backend). */
export function isMockApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
}

export const mockApiEnabledMessage =
  'Mode Mock API aktif — data disimpan di localStorage browser.';
