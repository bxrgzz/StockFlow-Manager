import { type Product, type InsertProduct, type Movement, type InsertMovement, products, movements } from "@shared/schema";
import { db } from "./db";
import { eq, lte, desc, gte, and, sql } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: InsertProduct): Promise<Product | undefined>;
  getProductsInAlert(): Promise<Product[]>;
  
  getMovements(): Promise<Movement[]>;
  getMovement(id: string): Promise<Movement | undefined>;
  createMovement(movement: InsertMovement): Promise<Movement>;
  getRecentMovements(limit: number): Promise<Movement[]>;
  
  getStats(): Promise<{
    totalProducts: number;
    productsInAlert: number;
    todayEntries: number;
    todayExits: number;
  }>;
}

export class PostgresStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: string, insertProduct: InsertProduct): Promise<Product | undefined> {
    const result = await db.update(products)
      .set(insertProduct)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async getProductsInAlert(): Promise<Product[]> {
    return await db.select()
      .from(products)
      .where(lte(products.currentStock, products.minStock))
      .orderBy(sql`(${products.currentStock}::float / NULLIF(${products.minStock}, 0))`);
  }

  async getMovements(): Promise<Movement[]> {
    return await db.select().from(movements).orderBy(desc(movements.createdAt));
  }

  async getMovement(id: string): Promise<Movement | undefined> {
    const result = await db.select().from(movements).where(eq(movements.id, id)).limit(1);
    return result[0];
  }

  async createMovement(insertMovement: InsertMovement): Promise<Movement> {
    const product = await this.getProduct(insertMovement.productId);
    if (!product) {
      throw new Error("Produto não encontrado");
    }

    const previousStock = product.currentStock;
    const newStock = insertMovement.type === "entrada"
      ? previousStock + insertMovement.quantity
      : previousStock - insertMovement.quantity;

    if (newStock < 0) {
      throw new Error("Estoque insuficiente para realizar a saída");
    }

    await db.update(products)
      .set({ currentStock: newStock })
      .where(eq(products.id, product.id));

    const result = await db.insert(movements).values({
      ...insertMovement,
      previousStock,
      newStock,
    }).returning();

    return result[0];
  }

  async getRecentMovements(limit: number = 10): Promise<Movement[]> {
    return await db.select().from(movements).orderBy(desc(movements.createdAt)).limit(limit);
  }

  async getStats(): Promise<{
    totalProducts: number;
    productsInAlert: number;
    todayEntries: number;
    todayExits: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allProducts = await db.select().from(products);
    const todayMovements = await db.select()
      .from(movements)
      .where(gte(movements.createdAt, today));

    return {
      totalProducts: allProducts.length,
      productsInAlert: allProducts.filter((p: Product) => p.currentStock <= p.minStock).length,
      todayEntries: todayMovements.filter((m: Movement) => m.type === "entrada").length,
      todayExits: todayMovements.filter((m: Movement) => m.type === "saida").length,
    };
  }
}

export const storage = new PostgresStorage();
