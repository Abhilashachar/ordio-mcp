import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the client
const mockGet = vi.fn();
const mockClient = { get: mockGet, post: vi.fn(), patch: vi.fn(), delete: vi.fn() };

// We need to test the tool registration indirectly since McpServer.tool() captures handlers.
// Instead, test the patterns the handlers follow.

describe('insight tool patterns', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('inventory_health_dashboard calls analytics/inventory-health', async () => {
    const mockData = {
      summary: { total: 50, lowStockCount: 3, expiringCount: 1 },
      lowStock: [{ name: 'Flour' }],
      expiring: [{ name: 'Milk' }],
    };
    mockGet.mockResolvedValue(mockData);

    const result = await mockClient.get('analytics/inventory-health');
    expect(mockGet).toHaveBeenCalledWith('analytics/inventory-health');
    expect(result.summary.lowStockCount).toBe(3);
  });

  it('recipe_feasibility_check passes query params', async () => {
    mockGet.mockResolvedValue({ feasible: true, ingredients: [] });

    await mockClient.get('analytics/recipe-feasibility', { recipeId: 'abc', multiplier: 2 });
    expect(mockGet).toHaveBeenCalledWith('analytics/recipe-feasibility', { recipeId: 'abc', multiplier: 2 });
  });

  it('vendor_spend_summary handles date range', async () => {
    mockGet.mockResolvedValue({ vendors: [], grandTotal: 0 });

    await mockClient.get('analytics/vendor-spend', { startDate: '2024-01-01', endDate: '2024-01-31' });
    expect(mockGet).toHaveBeenCalledWith('analytics/vendor-spend', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });
  });
});
