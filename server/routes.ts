import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertMovementSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produtos" });
    }
  });

  app.get("/api/products/alerts", async (req, res) => {
    try {
      const products = await storage.getProductsInAlert();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produtos em alerta" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produto" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const result = insertProductSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const product = await storage.createProduct(result.data);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar produto" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const result = insertProductSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const product = await storage.updateProduct(req.params.id, result.data);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar produto" });
    }
  });

  app.get("/api/movements", async (req, res) => {
    try {
      const movements = await storage.getMovements();
      const products = await storage.getProducts();
      
      const movementsWithProduct = movements.map(movement => {
        const product = products.find(p => p.id === movement.productId);
        return {
          ...movement,
          productName: product?.name || "Produto não encontrado",
          productSku: product?.sku || "-",
        };
      });

      res.json(movementsWithProduct);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar movimentações" });
    }
  });

  app.get("/api/movements/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const movements = await storage.getRecentMovements(limit);
      const products = await storage.getProducts();
      
      const movementsWithProduct = movements.map(movement => {
        const product = products.find(p => p.id === movement.productId);
        return {
          ...movement,
          productName: product?.name || "Produto não encontrado",
          productSku: product?.sku || "-",
        };
      });

      res.json(movementsWithProduct);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar movimentações recentes" });
    }
  });

  app.post("/api/movements", async (req, res) => {
    try {
      const result = insertMovementSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const movement = await storage.createMovement(result.data);
      res.status(201).json(movement);
    } catch (error: any) {
      if (error.message === "Produto não encontrado") {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === "Estoque insuficiente para realizar a saída") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao criar movimentação" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
