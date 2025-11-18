import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrendingUp, TrendingDown, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, InsertMovement } from "@shared/schema";
import { insertMovementSchema } from "@shared/schema";

export default function Movements() {
  const { toast } = useToast();

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertMovement) => apiRequest("POST", "/api/movements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/movements/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/alerts"] });
      toast({
        title: "Movimentação registrada com sucesso!",
        description: "O estoque foi atualizado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar movimentação",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Movimentações</h1>
        <p className="text-sm text-muted-foreground mt-1">Registre entradas e saídas de estoque</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Registrar Movimentação</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : products && products.length > 0 ? (
              <MovementForm
                products={products}
                onSubmit={(data) => createMutation.mutate(data)}
                isPending={createMutation.isPending}
              />
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum produto cadastrado</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicione produtos antes de registrar movimentações
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Guia Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/20">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Entrada</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adiciona produtos ao estoque (compras, devoluções, produção)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-900/20">
                  <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Saída</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Remove produtos do estoque (vendas, perdas, transferências)
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-2">Dicas Importantes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Todas as movimentações são registradas com data e hora automáticas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>O responsável é obrigatório para rastreabilidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Use observações para detalhar a operação quando necessário</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MovementFormProps {
  products: Product[];
  onSubmit: (data: InsertMovement) => void;
  isPending: boolean;
}

function MovementForm({ products, onSubmit, isPending }: MovementFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const form = useForm<InsertMovement>({
    resolver: zodResolver(insertMovementSchema),
    defaultValues: {
      productId: "",
      type: "entrada",
      quantity: 1,
      responsible: "",
      notes: "",
    },
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const movementType = form.watch("type");

  const handleSubmit = (data: InsertMovement) => {
    onSubmit(data);
    form.reset();
    setSelectedProductId("");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedProductId(value);
                }}
                value={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger data-testid="select-product">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">({product.sku})</span>
                        <Badge variant="outline" className="text-xs">
                          {product.currentStock} {product.unit}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedProduct && (
          <div className="rounded-md bg-muted p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Estoque Atual</p>
                <p className="font-semibold text-foreground mt-1">
                  {selectedProduct.currentStock} {selectedProduct.unit}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Estoque Mínimo</p>
                <p className="font-semibold text-foreground mt-1">
                  {selectedProduct.minStock} {selectedProduct.unit}
                </p>
              </div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Movimentação *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isPending}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="entrada"
                    className={`flex cursor-pointer items-center gap-3 rounded-md border-2 p-4 hover-elevate ${
                      field.value === "entrada" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="entrada" id="entrada" data-testid="radio-entrada" />
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Entrada</span>
                    </div>
                  </Label>
                  <Label
                    htmlFor="saida"
                    className={`flex cursor-pointer items-center gap-3 rounded-md border-2 p-4 hover-elevate ${
                      field.value === "saida" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="saida" id="saida" data-testid="radio-saida" />
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Saída</span>
                    </div>
                  </Label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    placeholder="0"
                    disabled={isPending}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-quantity"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nome do responsável"
                    disabled={isPending}
                    data-testid="input-responsible"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Detalhes adicionais sobre a movimentação (opcional)"
                  disabled={isPending}
                  data-testid="input-notes"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="min-w-[200px]"
            data-testid="button-submit-movement"
          >
            {isPending ? "Registrando..." : movementType === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
