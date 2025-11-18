import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, TrendingDown, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, Movement } from "@shared/schema";

interface Stats {
  totalProducts: number;
  productsInAlert: number;
  todayEntries: number;
  todayExits: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: alertProducts, isLoading: alertsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/alerts"],
  });

  const { data: recentMovements, isLoading: movementsLoading } = useQuery<(Movement & { productName: string, productSku: string })[]>({
    queryKey: ["/api/movements/recent"],
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral do seu estoque</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do seu estoque</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground" data-testid="stat-total-products">{stats?.totalProducts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Alerta</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="stat-products-alert">{stats?.productsInAlert || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entradas Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground" data-testid="stat-entries-today">{stats?.todayEntries || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saídas Hoje</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground" data-testid="stat-exits-today">{stats?.todayExits || 0}</div>
          </CardContent>
        </Card>
      </div>

      {alertsLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : (alertProducts && alertProducts.length > 0) ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">Produtos em Alerta</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Produtos abaixo do estoque mínimo</p>
            </div>
            <Link href="/products">
              <Button variant="outline" size="sm" data-testid="button-view-all-alerts">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertProducts.slice(0, 5).map((product) => {
                const percentage = (product.currentStock / product.minStock) * 100;
                const isCritical = percentage < 50;
                
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-4 rounded-md border border-border p-4 hover-elevate"
                    data-testid={`alert-product-${product.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground truncate">{product.name}</p>
                        <Badge variant={isCritical ? "destructive" : "secondary"} className="text-xs" data-testid={`badge-alert-level-${product.id}`}>
                          {isCritical ? "Crítico" : "Alerta"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mt-1">SKU: {product.sku}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Atual: <span className="font-semibold text-foreground">{product.currentStock}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Mínimo: <span className="font-semibold text-foreground">{product.minStock}</span>
                        </span>
                      </div>
                    </div>
                    <Link href="/movements">
                      <Button size="sm" data-testid={`button-restock-${product.id}`}>
                        Reabastecer
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">Movimentações Recentes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Últimas operações realizadas</p>
          </div>
          <Link href="/history">
            <Button variant="outline" size="sm" data-testid="button-view-full-history">
              Ver Histórico Completo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {movementsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentMovements && recentMovements.length > 0 ? (
            <div className="space-y-3">
              {recentMovements.slice(0, 10).map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between gap-4 rounded-md border border-border p-4 hover-elevate"
                  data-testid={`movement-${movement.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground truncate">{movement.productName}</p>
                      <Badge variant={movement.type === "entrada" ? "default" : "secondary"} data-testid={`badge-type-${movement.id}`}>
                        {movement.type === "entrada" ? "Entrada" : "Saída"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono mt-1">SKU: {movement.productSku}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                      <span className="text-muted-foreground">
                        Quantidade: <span className="font-semibold text-foreground">{movement.quantity} un</span>
                      </span>
                      <span className="text-muted-foreground">
                        Responsável: <span className="font-semibold text-foreground">{movement.responsible}</span>
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(movement.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhuma movimentação ainda</h3>
              <p className="text-sm text-muted-foreground mt-1">Registre sua primeira movimentação de estoque</p>
              <Link href="/movements">
                <Button className="mt-4" data-testid="button-create-first-movement">
                  Criar Movimentação
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
