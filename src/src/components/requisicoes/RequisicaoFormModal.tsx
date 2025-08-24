
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequisicaoWithRuas } from "@/types/requisicao";
import { useRequisicaoForm, RequisicaoFormSchema, RuaFormSchema } from "@/hooks/useRequisicaoForm";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, normalizeDateToNoon } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, MapPin, Plus, Ruler, Trash, X, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RequisicaoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requisicao: RequisicaoWithRuas | null;
}

const RequisicaoFormModal: React.FC<RequisicaoFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  requisicao
}) => {
  const {
    form,
    ruaForm,
    isSubmitting,
    isAddingRua,
    setIsAddingRua,
    onSubmit,
    addRua,
    removeRua,
    currentUser,
    funcionarioId,
    searchStatus,
    retrySearch
  } = useRequisicaoForm(requisicao, () => {
    onSuccess();
    onClose();
  });
  const [activeTab, setActiveTab] = useState("informacoes");
  const [engenheiroNome, setEngenheiroNome] = useState<string>("");

  // Fetch centers for dropdown
  const {
    data: centrosCusto = []
  } = useQuery({
    queryKey: ['centrosCusto'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('bd_centros_custo').select('id, nome_centro_custo, codigo_centro_custo').order('nome_centro_custo');
      if (error) throw error;
      return data;
    }
  });

  // Fetch engineers for dropdown, but filter for the current user if it's a new requisition
  const {
    data: engenheiros = []
  } = useQuery({
    queryKey: ['engenheiros', funcionarioId, !!requisicao?.id],
    queryFn: async () => {
      console.log("Fetching engineers with funcionarioId:", funcionarioId);
      console.log("Is editing existing requisicao:", !!requisicao?.id);

      // If we have a funcionarioId and this is a new requisition,
      // only fetch that specific engineer
      if (funcionarioId && !requisicao?.id) {
        console.log("Fetching only the current engineer with ID:", funcionarioId);
        const {
          data,
          error
        } = await supabase.from('bd_funcionarios').select('id, nome_completo, email').eq('id', funcionarioId);
        if (error) throw error;
        console.log("Found engineer data:", data);
        return data;
      } else {
        // Otherwise get all engineers for existing requisitions
        console.log("Fetching all engineers for existing requisition");
        const {
          data,
          error
        } = await supabase.from('bd_funcionarios').select('id, nome_completo, email').order('nome_completo');
        if (error) throw error;
        return data;
      }
    }
  });

  // Get the engineer name from their ID
  useEffect(() => {
    const getEngenheiroNome = async () => {
      const currentEngId = form.getValues("engenheiro_id");
      if (!currentEngId) return;

      // Find the engineer in our loaded list
      const engineer = engenheiros.find(eng => eng.id === currentEngId);
      if (engineer) {
        setEngenheiroNome(engineer.nome_completo);
      } else if (currentEngId) {
        // If not found in our list, fetch it directly
        const {
          data,
          error
        } = await supabase.from('bd_funcionarios').select('nome_completo').eq('id', currentEngId).maybeSingle();
        if (data) {
          setEngenheiroNome(data.nome_completo);
        }
        if (error) {
          console.error("Error fetching engineer name:", error);
        }
      }
    };
    getEngenheiroNome();
  }, [form.getValues("engenheiro_id"), engenheiros]);

  // Render search status indicator
  const renderSearchStatus = () => {
    switch (searchStatus) {
      case 'searching':
        return (
          <Alert className="mb-4">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Buscando seu usuário no sistema...
            </AlertDescription>
          </Alert>
        );
      case 'found':
        return (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Usuário encontrado com sucesso! Você pode prosseguir com a requisição.
            </AlertDescription>
          </Alert>
        );
      case 'not_found':
        return (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Não foi possível encontrar seu usuário automaticamente. 
              <Button 
                variant="link" 
                className="p-0 h-auto text-yellow-800 underline ml-1"
                onClick={retrySearch}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Erro ao buscar usuário. Verifique se você está logado corretamente.
              <Button 
                variant="link" 
                className="p-0 h-auto text-red-800 underline ml-1"
                onClick={retrySearch}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const pinturaOptions = ["IMPRIMA", "RR"];
  const tracoOptions = ["Binder", "5A", "4C"];
  const ruas = form.watch('ruas') || [];

  // Calculate total area and volume for all streets
  const totalArea = ruas.reduce((sum, rua) => sum + (rua.area || 0), 0);
  const totalVolume = ruas.reduce((sum, rua) => sum + (rua.volume || 0), 0);

  // Handle adding a new street
  const handleAddRua = () => {
    setIsAddingRua(true);
  };
  const handleSubmit = async (data: RequisicaoFormSchema) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col py-[8px] mx-0 px-[36px]">
        <DialogHeader>
          <DialogTitle>
            {requisicao && requisicao.id ? "Editar Requisição" : "Nova Requisição"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos para {requisicao && requisicao.id ? "editar a" : "criar uma nova"} requisição
          </DialogDescription>
        </DialogHeader>
        
        {/* Search Status Indicator */}
        {!requisicao?.id && renderSearchStatus()}
        
        <Form {...form}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="informacoes">Informações Gerais</TabsTrigger>
              <TabsTrigger value="ruas">Lista de Ruas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="informacoes" className="space-y-6">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Centro de Custo */}
                 <FormField control={form.control} name="centro_custo_id" render={({ field }) => (
          //alteração realizada ,foi inserido um campo de pesquisa por texto .18/06/25/
             <FormItem>
                <FormLabel>Centro de Custo <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <>
                    <Input
                      list="centrosCustoList"
                      placeholder="Digite para pesquisar"
                      onChange={(e) => {
                        const input = e.target.value;
                        const selected = centrosCusto.find(
                          centro =>
                            `${centro.codigo_centro_custo} - ${centro.nome_centro_custo}` === input
                        );
                        field.onChange(selected ? selected.id : ''); // salva o id ou zera
                      }}
                    />
                    <datalist id="centrosCustoList">
                      {centrosCusto.map((centro) => (
                        <option
                          key={centro.id}
                          value={`${centro.codigo_centro_custo} - ${centro.nome_centro_custo}`}
                        />
                      ))}
                    </datalist>
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
        )} />   
                  {/* Diretoria */}
                  <FormField control={form.control} name="diretoria" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Diretoria</FormLabel>
                        <FormControl>
                          <Input placeholder="Diretoria" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  {/* Gerência */}
                  <FormField control={form.control} name="gerencia" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Gerência</FormLabel>
                        <FormControl>
                          <Input placeholder="Gerência" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  {/* Engenheiro Responsável */}
                  <FormField control={form.control} name="engenheiro_id" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Engenheiro Responsável *</FormLabel>
                        {!requisicao?.id && funcionarioId ?
                  // For new requisitions, use funcionario ID automatically
                  <FormControl>
                            <Input value={engenheiroNome || "Engenheiro selecionado"} disabled className="bg-muted/30" />
                          </FormControl> :
                  // For existing requisitions or if no funcionario ID, allow selection
                  <Select onValueChange={value => {
                    field.onChange(value);
                    const engineer = engenheiros.find(eng => eng.id === value);
                    if (engineer) {
                      setEngenheiroNome(engineer.nome_completo);
                    }
                  }} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o engenheiro" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {engenheiros.map(engenheiro => <SelectItem key={engenheiro.id} value={engenheiro.id}>
                                  {engenheiro.nome_completo}
                                </SelectItem>)}
                            </SelectContent>
                          </Select>}
                        <FormMessage />
                      </FormItem>} />
                  
                  {/* Data da Requisição */}
                  <FormField control={form.control} name="data_requisicao" render={({
                  field
                }) => <FormItem className="flex flex-col">
                        <FormLabel>Data da Requisição *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(new Date(field.value), "dd/MM/yyyy") : <span>Selecione uma data</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar 
                              mode="single" 
                              selected={field.value ? new Date(field.value) : undefined} 
                              onSelect={(date) => {
                                if (date) {
                                  // Cria uma data normalizada ao meio-dia para evitar problemas de timezone
                                  const normalizedDate = normalizeDateToNoon(date);
                                  if (normalizedDate) {
                                    // Usar formato YYYY-MM-DD sem converter para ISO
                                    const formattedDate = format(normalizedDate, "yyyy-MM-dd");
                                    console.log("Data selecionada:", formattedDate);
                                    field.onChange(formattedDate);
                                  }
                                }
                              }}
                              disabled={(date) => {
                                // Disable future dates more than 1 day ahead
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                return date > tomorrow;
                              }} 
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>} />
                </div>
                
                {/* Summary Section */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Resumo da Requisição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Total de Ruas</h4>
                        <p className="text-2xl font-bold">{ruas.length}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Área Total (m²)</h4>
                        <p className="text-2xl font-bold">{totalArea.toFixed(2)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Total (t)</h4>
                        <p className="text-2xl font-bold">{totalVolume.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
              
              <div className="flex justify-end pt-4 border-t">
                <Button type="button" onClick={() => setActiveTab("ruas")} className="px-6">
                  Próximo: Lista de Ruas
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="ruas" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Lista de Ruas</h3>
                <Button type="button" onClick={handleAddRua} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Rua
                </Button>
              </div>
              
              <ScrollArea className="h-[50vh]">
                {ruas.length > 0 ? <Table className="border rounded-md overflow-hidden">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Logradouro</TableHead>
                        <TableHead>Bairro</TableHead>
                        <TableHead>Dimensões</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Área (m²)</TableHead>
                        <TableHead className="text-right">Peso (t)</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ruas.map((rua, index) => <TableRow key={index}>
                          <TableCell className="font-medium">{rua.logradouro}</TableCell>
                          <TableCell>{rua.bairro || "-"}</TableCell>
                          <TableCell>
                            {rua.largura}m × {rua.comprimento}m × {rua.espessura}m
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <span>Pintura: {rua.pintura_ligacao}</span>
                              <span>Traço: {rua.traco}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{rua.area?.toFixed(2) || (rua.largura * rua.comprimento).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            {rua.volume?.toFixed(2) || (rua.largura * rua.comprimento * rua.espessura * 2.4).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeRua(index)}>
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table> : <div className="text-center p-10 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground mb-4">
                      Nenhuma rua adicionada. Clique em "Adicionar Rua" para começar.
                    </p>
                    <Button type="button" onClick={handleAddRua} variant="outline">
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Rua
                    </Button>
                  </div>}
                
                {/* Form error for ruas array */}
                {form.formState.errors.ruas && <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.ruas.message}
                  </p>}
              </ScrollArea>
              
              <div className="flex justify-between pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("informacoes")}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Voltar
                </Button>
                
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    onClick={form.handleSubmit(handleSubmit)} 
                    disabled={isSubmitting || (searchStatus !== 'found' && !requisicao?.id)}
                  >
                    {isSubmitting ? <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                        Salvando...
                      </> : requisicao && requisicao.id ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Form>
        
        {/* Modal para adicionar rua */}
        {isAddingRua && <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">Adicionar Nova Rua</CardTitle>
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddingRua(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={ruaForm.handleSubmit(data => addRua(data as RuaFormSchema))} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Logradouro */}
                    <div className="space-y-2">
                      <Label htmlFor="logradouro">Logradouro *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="logradouro" placeholder="Nome da rua" className="pl-8" {...ruaForm.register("logradouro")} />
                      </div>
                      {ruaForm.formState.errors.logradouro && <p className="text-sm font-medium text-destructive">
                          {ruaForm.formState.errors.logradouro.message}
                        </p>}
                    </div>
                    
                    {/* Bairro */}
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input id="bairro" placeholder="Bairro" {...ruaForm.register("bairro")} />
                    </div>
                    
                    {/* Pintura de Ligação */}
                    <div className="space-y-2">
                      <Label htmlFor="pintura_ligacao">Pintura de Ligação *</Label>
                      <Select onValueChange={value => ruaForm.setValue("pintura_ligacao", value)} defaultValue={ruaForm.getValues("pintura_ligacao")}>
                        <SelectTrigger id="pintura_ligacao">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {pinturaOptions.map(option => <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      {ruaForm.formState.errors.pintura_ligacao && <p className="text-sm font-medium text-destructive">
                          {ruaForm.formState.errors.pintura_ligacao.message}
                        </p>}
                    </div>
                    
                    {/* Traço */}
                    <div className="space-y-2">
                      <Label htmlFor="traco">Traço *</Label>
                      <Select onValueChange={value => ruaForm.setValue("traco", value)} defaultValue={ruaForm.getValues("traco")}>
                        <SelectTrigger id="traco">
                          <SelectValue placeholder="Selecione o traço" />
                        </SelectTrigger>
                        <SelectContent>
                          {tracoOptions.map(option => <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      {ruaForm.formState.errors.traco && <p className="text-sm font-medium text-destructive">
                          {ruaForm.formState.errors.traco.message}
                        </p>}
                    </div>
                    
                    {/* Comprimento */}
                    <div className="space-y-2">
                      <Label htmlFor="comprimento">Comprimento (m) *</Label>
                      <div className="relative">
                        <Ruler className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="comprimento" type="number" step="0.01" placeholder="0.00" className="pl-8" {...ruaForm.register("comprimento", {
                      valueAsNumber: true
                    })} />
                      </div>
                      {ruaForm.formState.errors.comprimento && <p className="text-sm font-medium text-destructive">
                          {ruaForm.formState.errors.comprimento.message}
                        </p>}
                    </div>
                    
                    {/* Largura */}
                    <div className="space-y-2">
                      <Label htmlFor="largura">Largura (m) *</Label>
                      <div className="relative">
                        <Ruler className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="largura" type="number" step="0.01" placeholder="0.00" className="pl-8" {...ruaForm.register("largura", {
                      valueAsNumber: true
                    })} />
                      </div>
                      {ruaForm.formState.errors.largura && <p className="text-sm font-medium text-destructive">
                          {ruaForm.formState.errors.largura.message}
                        </p>}
                    </div>
                    
                    {/* Espessura */}
                    <div className="space-y-2">
                      <Label htmlFor="espessura">Espessura (m) *</Label>
                      <div className="relative">
                        <Ruler className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="espessura" type="number" step="0.01" placeholder="0.00" className="pl-8" {...ruaForm.register("espessura", {
                      valueAsNumber: true
                    })} />
                      </div>
                      {ruaForm.formState.errors.espessura && <p className="text-sm font-medium text-destructive">
                          {ruaForm.formState.errors.espessura.message}
                        </p>}
                    </div>
                    
                    {/* Área */}
                    <div className="space-y-2">
                      <Label htmlFor="area">Área (m²)</Label>
                      <Input id="area" type="number" step="0.01" placeholder="Calculado automaticamente" value={ruaForm.watch("largura") && ruaForm.watch("comprimento") ? (ruaForm.watch("largura") * ruaForm.watch("comprimento")).toFixed(2) : ""} disabled className="bg-muted/30" />
                    </div>
                    
                    {/* Peso (antes Volume) */}
                    <div className="space-y-2">
                      <Label htmlFor="volume">Peso (t)</Label>
                      <Input id="volume" type="number" step="0.01" placeholder="Calculado automaticamente" value={ruaForm.watch("largura") && ruaForm.watch("comprimento") && ruaForm.watch("espessura") ? (ruaForm.watch("largura") * ruaForm.watch("comprimento") * ruaForm.watch("espessura") * 2.4).toFixed(2) : ""} disabled className="bg-muted/30" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddingRua(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Adicionar Rua</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>}
      </DialogContent>
    </Dialog>;
};
export default RequisicaoFormModal;
