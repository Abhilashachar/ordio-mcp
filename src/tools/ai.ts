import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatItem, formatList } from '../utils/format.js';

export function registerAITools(server: McpServer, client: OrdioClient) {
  server.tool(
    'ai_process_invoice',
    'Extract line items from invoice images using AI vision. Returns structured item data (name, quantity, unit, price).',
    {
      invoiceId: z.string().optional().describe('Invoice ID to associate results with'),
      imageUrls: z.array(z.string()).min(1).describe('Array of image URLs to process'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/process-invoice', args);
      return formatItem(data, 'Invoice extraction');
    }),
  );

  server.tool(
    'ai_extract_totals',
    'Extract financial totals (subtotal, tax, total) from invoice images.',
    {
      imageUrls: z.array(z.string()).min(1).describe('Array of image URLs to process'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/extract-totals', args);
      return formatItem(data, 'Totals extraction');
    }),
  );

  server.tool(
    'ai_unit_conversion',
    "Get AI-powered unit conversion factor. Handles tricky conversions like 'bunch of cilantro' to 'oz'.",
    {
      fromUnit: z.string().describe('Unit to convert from'),
      toUnit: z.string().describe('Unit to convert to'),
      itemName: z.string().optional().describe('Item name for context-aware conversion'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/unit-conversion', args);
      return formatItem(data, 'Unit conversion');
    }),
  );

  server.tool(
    'ai_extract_recipes',
    'Extract structured recipe data from unstructured text (pasted from websites, PDFs, etc.).',
    {
      text: z.string().describe('Unstructured text containing recipe data'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/extract-recipes', args);
      return formatItem(data, 'Recipe extraction');
    }),
  );

  server.tool(
    'ai_extract_recipe_image',
    'Extract a recipe from a photo of a recipe card, cookbook page, or handwritten notes.',
    {
      base64Data: z.string().describe('Base64-encoded image data'),
      mimeType: z.string().describe('MIME type of the image (e.g. image/png, image/jpeg)'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/extract-recipe-image', args);
      return formatItem(data, 'Recipe image extraction');
    }),
  );

  server.tool(
    'ai_extract_inventory',
    'Extract structured inventory items from text or pasted CSV data.',
    {
      text: z.string().describe('Text or CSV data containing inventory items'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/extract-inventory', args);
      return formatItem(data, 'Inventory extraction');
    }),
  );

  server.tool(
    'ai_extract_document',
    'OCR: Extract text content from a PDF or image document.',
    {
      base64Data: z.string().describe('Base64-encoded document data'),
      mimeType: z.string().describe('MIME type of the document (e.g. application/pdf, image/png)'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/extract-document', args);
      return formatItem(data, 'Document extraction');
    }),
  );

  server.tool(
    'ai_parse_unit',
    'Normalize scanned or messy unit strings into standard units.',
    {
      scannedQuantity: z.number().describe('The scanned quantity value'),
      scannedUnit: z.string().describe('The scanned unit string to normalize'),
      inventoryItemName: z.string().optional().describe('Inventory item name for context'),
      inventoryItemUnit: z.string().optional().describe('Expected inventory item unit'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/parse-unit', args);
      return formatItem(data, 'Unit parsing');
    }),
  );

  server.tool(
    'ai_generate_recipe',
    'Generate a complete recipe with ingredients, instructions, and timing for a menu item.',
    {
      menuItemName: z.string().describe('Name of the menu item'),
      description: z.string().optional().describe('Description of the menu item'),
      existingIngredients: z.array(z.string()).optional().describe('List of existing ingredient names to prefer'),
      servings: z.number().optional().describe('Target number of servings'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/generate-recipe', args);
      return formatItem(data, 'Generated recipe');
    }),
  );

  server.tool(
    'ai_batch_generate_recipes',
    'Generate recipes for multiple menu items at once.',
    {
      menuItems: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
      })).min(1).describe('Array of menu items to generate recipes for'),
      existingIngredients: z.array(z.string()).optional().describe('List of existing ingredient names to prefer'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/batch-generate-recipes', args);
      return formatItem(data, 'Batch generated recipes');
    }),
  );

  server.tool(
    'ai_generate_quantities',
    'AI-powered recipe scaling. Adjusts ingredient quantities for different serving counts.',
    {
      recipeName: z.string().describe('Name of the recipe'),
      ingredients: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
      })).min(1).describe('Array of ingredients with current quantities'),
      expectedServings: z.number().describe('Target number of servings'),
      currentServings: z.number().describe('Current number of servings the recipe makes'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('integrations/ai/generate-quantities', args);
      return formatItem(data, 'Scaled quantities');
    }),
  );
}
