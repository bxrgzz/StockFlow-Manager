import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, X, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, Movement } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type MovementWithProduct = Movement & {
  productName: string;
  productSku: string;
};

export default function History() {
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: movements, isLoading: movementsLoading } = useQuery<MovementWithProduct[]>({
    queryKey: ["/api/movements"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredMovements = movements?.filter((movement) => {
    const matchesProduct = filterProduct === "all" || movement.productId === filterProduct;
    const matchesType = filterType === "all" || movement.type === filterType;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      movement.productName.toLowerCase().includes(search) ||
      movement.productSku.toLowerCase().includes(search) ||
      movement.responsible.toLowerCase().includes(search) ||
      movement.notes?.toLowerCase().includes(search);

    return matchesProduct && matchesType && matchesSearch;
  });

  const hasActiveFilters = filterProduct !== "all" || filterType !== "all" || searchTerm !== "";

  const clearFilters = () => {
    setFilterProduct("all");
    setFilterType("all");
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Histórico</h1>
        <p className="text-sm text-muted-foreground mt-1">Histórico completo de movimentações de estoque</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Produto, SKU, responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-history"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-product">Produto</Label>
              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger id="filter-product" data-testid="select-filter-product">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {productsLoading ? (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : (
                    products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-type">Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filter-type" data-testid="select-filter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-lg font-semibold">
              Movimentações
              {filteredMovements && ` (${filteredMovements.length})`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {movementsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredMovements && filteredMovements.length > 0 ? (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Data/Hora</TableHead>
                    <TableHead className="font-medium">Produto</TableHead>
                    <TableHead className="font-medium">SKU</TableHead>
                    <TableHead className="font-medium text-center">Tipo</TableHead>
                    <TableHead className="font-medium text-center">Quantidade</TableHead>
                    <TableHead className="font-medium text-center">Estoque Anterior</TableHead>
                    <TableHead className="font-medium text-center">Estoque Novo</TableHead>
                    <TableHead className="font-medium">Responsável</TableHead>
                    <TableHead className="font-medium">Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.id} data-testid={`history-row-${movement.id}`}>
                      <TableCell className="text-sm whitespace-nowrap">
                        <div>
                          <div className="font-medium">
                            {format(new Date(movement.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {format(new Date(movement.createdAt), "HH:mm:ss")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{movement.productName}</TableCell>
                      <TableCell className="font-mono text-sm">{movement.productSku}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={movement.type === "entrada" ? "default" : "secondary"}
                          data-testid={`badge-type-${movement.id}`}
                        >
                          {movement.type === "entrada" ? (
                            <>
                              <TrendingUp className="mr-1 h-3 w-3" />
                              Entrada
                            </>
                          ) : (
                            <>
                              <TrendingDown className="mr-1 h-3 w-3" />
                              Saída
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold" data-testid={`quantity-${movement.id}`}>
                        {movement.quantity}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {movement.previousStock}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {movement.newStock}
                      </TableCell>
                      <TableCell>{movement.responsible}</TableCell>
                      <TableCell className="max-w-xs">
                        {movement.notes ? (
                          <span className="text-sm text-muted-foreground truncate block">
                            {movement.notes}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {hasActiveFilters ? "Nenhuma movimentação encontrada" : "Nenhuma movimentação registrada"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {hasActiveFilters
                  ? "Tente ajustar os filtros para ver mais resultados"
                  : "As movimentações aparecerão aqui quando forem registradas"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
