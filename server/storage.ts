import { type Product, type InsertProduct, type Movement, type InsertMovement } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private movements: Map<string, Movement>;

  constructor() {
    this.products = new Map();
    this.movements = new Map();
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      description: insertProduct.description || null,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, insertProduct: InsertProduct): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Product = {
      ...insertProduct,
      description: insertProduct.description || null,
      id,
      createdAt: existing.createdAt,
    };
    this.products.set(id, updated);
    return updated;
  }

  async getProductsInAlert(): Promise<Product[]> {
    const products = Array.from(this.products.values());
    return products
      .filter(product => product.currentStock <= product.minStock)
      .sort((a, b) => {
        const percentageA = a.minStock > 0 ? (a.currentStock / a.minStock) : 1;
        const percentageB = b.minStock > 0 ? (b.currentStock / b.minStock) : 1;
        return percentageA - percentageB;
      });
  }

  async getMovements(): Promise<Movement[]> {
    return Array.from(this.movements.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getMovement(id: string): Promise<Movement | undefined> {
    return this.movements.get(id);
  }

  async createMovement(insertMovement: InsertMovement): Promise<Movement> {
    const product = this.products.get(insertMovement.productId);
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

    product.currentStock = newStock;
    this.products.set(product.id, product);

    const id = randomUUID();
    const movement: Movement = {
      ...insertMovement,
      notes: insertMovement.notes || null,
      id,
      previousStock,
      newStock,
      createdAt: new Date(),
    };
    this.movements.set(id, movement);
    return movement;
  }

  async getRecentMovements(limit: number = 10): Promise<Movement[]> {
    const allMovements = await this.getMovements();
    return allMovements.slice(0, limit);
  }

  async getStats(): Promise<{
    totalProducts: number;
    productsInAlert: number;
    todayEntries: number;
    todayExits: number;
  }> {
    const products = Array.from(this.products.values());
    const movements = Array.from(this.movements.values());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMovements = movements.filter(m => {
      const movementDate = new Date(m.createdAt);
      movementDate.setHours(0, 0, 0, 0);
      return movementDate.getTime() === today.getTime();
    });

    return {
      totalProducts: products.length,
      productsInAlert: products.filter(p => p.currentStock <= p.minStock).length,
      todayEntries: todayMovements.filter(m => m.type === "entrada").length,
      todayExits: todayMovements.filter(m => m.type === "saida").length,
    };
  }
}

export const storage = new MemStorage();
