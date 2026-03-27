import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerWorkflowPrompts(server: McpServer) {
  server.prompt(
    'inventory-audit',
    'Step-by-step inventory audit with anomaly detection and reorder suggestions',
    { category: z.string().optional().describe('Limit audit to a specific category') },
    async ({ category }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Perform an inventory audit${category ? ` for category "${category}"` : ''}. Follow these steps:\n1. Use inventory_health_dashboard or list_inventory to get all${category ? ` "${category}"` : ''} items\n2. Identify anomalies: items below par level, expired or expiring items, items with zero quantity\n3. For items with quantity discrepancies or no recent count, flag them\n4. Create a summary of findings with recommended corrective actions\n5. If any items are below par level, suggest reorder quantities grouped by vendor\nReport your findings in a clear, actionable format.`,
        },
      }],
    }),
  );

  server.prompt(
    'purchase-order-workflow',
    'Generate a purchase order based on current inventory needs',
    { vendorId: z.string().optional().describe('Limit to a specific vendor') },
    async ({ vendorId }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Create a purchase order${vendorId ? ` for vendor ${vendorId}` : ' based on current needs'}. Follow these steps:\n1. Check inventory levels — find all items below par level\n2. Group items by vendor\n3. For each vendor group, calculate suggested order quantities (par level minus current quantity)\n4. Estimate total cost based on last known unit costs\n5. Present the order summary for review\n6. Once confirmed, create the purchase order`,
        },
      }],
    }),
  );

  server.prompt(
    'shift-scheduling',
    'Create an optimized shift schedule for a given week',
    {
      weekStart: z.string().optional().describe('Start date of the week (YYYY-MM-DD)'),
    },
    async ({ weekStart }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Help me create an optimized shift schedule${weekStart ? ` for the week starting ${weekStart}` : ' for the upcoming week'}. Follow these steps:\n1. List all active team members and their roles\n2. Check existing shifts and shift requests\n3. Identify coverage gaps and overstaffed periods\n4. Suggest an optimized schedule that balances hours across team members\n5. Flag any conflicts or issues\nPresent the schedule in a clear format.`,
        },
      }],
    }),
  );

  server.prompt(
    'end-of-day-closing',
    'End-of-day closing checklist for restaurant operations',
    {},
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Run the end-of-day closing checklist:\n1. Review all tasks — show completed vs pending for today\n2. Check temperature logs for compliance (any out-of-range readings)\n3. Review kitchen order metrics — total orders, average time, any issues\n4. Summarize today's sales vs labor cost\n5. List any active alerts that need attention\n6. Flag items to prep for tomorrow (low stock, scheduled batches)\nPresent a concise closing summary.`,
        },
      }],
    }),
  );

  server.prompt(
    'recipe-costing',
    'Analyze and optimize food costs for recipes',
    { recipeId: z.string().optional().describe('Specific recipe to analyze') },
    async ({ recipeId }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Analyze food costs${recipeId ? ` for recipe ${recipeId}` : ' across all active recipes'}. Follow these steps:\n1. Pull recipe ingredients and current inventory costs\n2. Calculate food cost percentage for each recipe (ingredient cost / selling price × 100)\n3. Flag any recipe with food cost above 35%\n4. Identify the most expensive ingredients driving high costs\n5. Suggest optimizations: portion adjustments, ingredient substitutions, or vendor changes\nPresent findings in a clear table format.`,
        },
      }],
    }),
  );

  server.prompt(
    'new-menu-item-setup',
    'Complete setup workflow for adding a new menu item',
    {
      name: z.string().describe('Name of the new menu item'),
      price: z.string().optional().describe('Selling price'),
      description: z.string().optional().describe('Item description'),
    },
    async ({ name, price, description }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Set up a new menu item: "${name}"${price ? ` at $${price}` : ''}${description ? ` — ${description}` : ''}. Follow these steps:\n1. Create the menu item with the provided details\n2. Use ai_generate_recipe to generate a recipe based on the item name and description\n3. Review the generated recipe — check ingredients against current inventory\n4. Use recipe_feasibility_check to verify all ingredients are available\n5. Calculate the food cost percentage\n6. If food cost is acceptable, finalize the setup\n7. If not, suggest adjustments to portions or ingredients\nGuide me through each step.`,
        },
      }],
    }),
  );
}
