import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Search, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";
import { insertProductSchema } from "@shared/schema";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/alerts"] });
      setIsCreateOpen(false);
      toast({
        title: "Produto criado com sucesso!",
        description: "O produto foi adicionado ao estoque.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar produto",
        description: "Ocorreu um erro ao criar o produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertProduct }) =>
      apiRequest("PATCH", `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/alerts"] });
      setEditingProduct(null);
      toast({
        title: "Produto atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar produto",
        description: "Ocorreu um erro ao atualizar o produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products?.filter((product) => {
    const search = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, SKU ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
              data-testid="input-search-products"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">SKU</TableHead>
                    <TableHead className="font-medium">Nome</TableHead>
                    <TableHead className="font-medium">Descrição</TableHead>
                    <TableHead className="font-medium text-center">Estoque Atual</TableHead>
                    <TableHead className="font-medium text-center">Estoque Mínimo</TableHead>
                    <TableHead className="font-medium text-center">Status</TableHead>
                    <TableHead className="font-medium text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const isAlert = product.currentStock <= product.minStock;
                    const percentage = product.minStock > 0 ? (product.currentStock / product.minStock) * 100 : 100;
                    const isCritical = percentage < 50;

                    return (
                      <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {product.description || "-"}
                        </TableCell>
                        <TableCell className="text-center font-semibold" data-testid={`current-stock-${product.id}`}>
                          {product.currentStock} {product.unit}
                        </TableCell>
                        <TableCell className="text-center font-semibold" data-testid={`min-stock-${product.id}`}>
                          {product.minStock} {product.unit}
                        </TableCell>
                        <TableCell className="text-center">
                          {isAlert ? (
                            <Badge variant={isCritical ? "destructive" : "secondary"} data-testid={`status-badge-${product.id}`}>
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              {isCritical ? "Crítico" : "Alerta"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" data-testid={`status-badge-${product.id}`}>Normal</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm
                  ? "Tente buscar com outros termos"
                  : "Comece adicionando seu primeiro produto"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={(data) => updateMutation.mutate({ id: editingProduct.id, data })}
              isPending={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: InsertProduct) => void;
  isPending: boolean;
}

function ProductForm({ initialData, onSubmit, isPending }: ProductFormProps) {
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: initialData
      ? {
          sku: initialData.sku,
          name: initialData.name,
          description: initialData.description || "",
          currentStock: initialData.currentStock,
          minStock: initialData.minStock,
          unit: initialData.unit,
        }
      : {
          sku: "",
          name: "",
          description: "",
          currentStock: 0,
          minStock: 0,
          unit: "un",
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="ABC-123"
                    disabled={isPending}
                    data-testid="input-sku"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nome do produto"
                    disabled={isPending}
                    data-testid="input-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Descrição detalhada do produto"
                  disabled={isPending}
                  data-testid="input-description"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="currentStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque Atual *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="0"
                    disabled={isPending}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-current-stock"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque Mínimo *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="0"
                    disabled={isPending}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-min-stock"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="un, kg, L"
                    disabled={isPending}
                    data-testid="input-unit"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isPending} data-testid="button-save-product">
            {isPending ? "Salvando..." : "Salvar Produto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
