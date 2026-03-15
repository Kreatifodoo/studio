/**
 * @fileOverview A client-compatible function for suggesting common customization options or dietary notes for menu items.
 *
 * - getOrderItemCustomizationSuggestions - A function that suggests customization options or dietary notes for a given menu item.
 * - OrderItemCustomizationSuggestionsInput - The input type for the getOrderItemCustomizationSuggestions function.
 * - OrderItemCustomizationSuggestionsOutput - The return type for the getOrderItemCustomizationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrderItemCustomizationSuggestionsInputSchema = z.object({
  itemName: z.string().describe('The name of the menu item.'),
  itemDescription: z
    .string()
    .optional()
    .describe('An optional description of the menu item.'),
  itemCategory: z
    .string()
    .optional()
    .describe('An optional category of the menu item (e.g., "Drinks", "Main Course").'),
});
export type OrderItemCustomizationSuggestionsInput = z.infer<
  typeof OrderItemCustomizationSuggestionsInputSchema
>;

const OrderItemCustomizationSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of common customization options or dietary notes for the menu item.'
    ),
});
export type OrderItemCustomizationSuggestionsOutput = z.infer<
  typeof OrderItemCustomizationSuggestionsOutputSchema
>;

export async function getOrderItemCustomizationSuggestions(
  input: OrderItemCustomizationSuggestionsInput
): Promise<OrderItemCustomizationSuggestionsOutput> {
  // Direct flow execution without 'use server' to support static export
  return orderItemCustomizationSuggestionsFlow(input);
}

const suggestCustomizationsPrompt = ai.definePrompt({
  name: 'suggestCustomizationsPrompt',
  input: {schema: OrderItemCustomizationSuggestionsInputSchema},
  output: {schema: OrderItemCustomizationSuggestionsOutputSchema},
  prompt: `You are a helpful assistant for a cashier in a point-of-sale system. Your task is to suggest common customization options or dietary notes for a given menu item to help the cashier quickly and accurately capture customer preferences. Provide a concise list of suggestions.

Menu Item Name: {{{itemName}}}
{{#if itemCategory}}Category: {{{itemCategory}}}{{/if}}
{{#if itemDescription}}Description: {{{itemDescription}}}{{/if}}

Examples:
- For "Burger": "No onions", "Extra cheese", "Well done", "No bun"
- For "Latte": "Oat milk", "Decaf", "Extra shot", "Sugar-free syrup"
- For "Caesar Salad": "No croutons", "Dressing on the side", "Add chicken"
- For "French Fries": "No salt", "Extra crispy"

Suggestions for "{{{itemName}}}":`,
});

const orderItemCustomizationSuggestionsFlow = ai.defineFlow(
  {
    name: 'orderItemCustomizationSuggestionsFlow',
    inputSchema: OrderItemCustomizationSuggestionsInputSchema,
    outputSchema: OrderItemCustomizationSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await suggestCustomizationsPrompt(input);
    return output!;
  }
);
