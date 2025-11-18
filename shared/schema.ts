import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  currentStock: integer("current_stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  unit: text("unit").notNull().default("un"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).extend({
  sku: z.string().min(1, "SKU é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  currentStock: z.coerce.number().int().min(0, "Estoque atual deve ser maior ou igual a 0"),
  minStock: z.coerce.number().int().min(0, "Estoque mínimo deve ser maior ou igual a 0"),
  unit: z.string().min(1, "Unidade é obrigatória"),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const movements = pgTable("movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  responsible: text("responsible").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertMovementSchema = createInsertSchema(movements).omit({
  id: true,
  createdAt: true,
  previousStock: true,
  newStock: true,
}).extend({
  productId: z.string().min(1, "Produto é obrigatório"),
  type: z.enum(["entrada", "saida"], { required_error: "Tipo é obrigatório" }),
  quantity: z.coerce.number().int().min(1, "Quantidade deve ser maior que 0"),
  responsible: z.string().min(1, "Responsável é obrigatório"),
});

export type InsertMovement = z.infer<typeof insertMovementSchema>;
export type Movement = typeof movements.$inferSelect;
