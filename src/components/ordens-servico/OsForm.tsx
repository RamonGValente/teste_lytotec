
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle, FileDown, Plus, Trash, Wrench } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { OrdemServico, Material, MaoDeObra } from "@/types/ordemServico";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<OrdemServico>, motivo: string) => Promise<void>;
  onSaveMaterial: (material: Partial<Material>) => Promise<void>;
  onDeleteMaterial: (materialId: string) => Promise<void>;
  onSaveMaoDeObra: (maoDeObra: Partial<MaoDeObra>) => Promise<void>;
  onDeleteMaoDeObra: (maoDeObraId: string) => Promise<void>;
  onFinishOs: (osId: string) => Promise<void>;
  onGeneratePdf: (osId: string) => Promise<void>;
  currentOs: OrdemServico | null;
  materials: Material[];
  laborItems: MaoDeObra[];
  isLoading: boolean;
  currentUser: any;
  departamentosOptions: { id: string; label: string }[];
}

const OsForm: React.FC<OsFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSaveMaterial,
  onDeleteMaterial,
  onSaveMaoDeObra,
  onDeleteMaoDeObra,
  onFinishOs,
  onGeneratePdf,
  currentOs,
  materials,
  laborItems,
  isLoading,
  currentUser,
  departamentosOptions
}) => {
  const [activeTab, setActiveTab] = useState("cabecalho");
  const [motivoEdicao, setMotivoEdicao] = useState("");
  const { toast } = useToast();
  
  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [materialForm, setMaterialForm] = useState({
    id: "",
    quantidade: 0,
    descricao_material: "",
    valor_unitario: 0,
    valor_total: 0
  });

  const [laborFormOpen, setLaborFormOpen] = useState(false);
  const [currentLabor, setCurrentLabor] = useState<MaoDeObra | null>(null);
  const [laborForm, setLaborForm] = useState({
    id: "",
    quantidade: 0,
    funcao: "",
    valor_unitario: 0,
    valor_total: 0
  });

  useEffect(() => {
    if (currentOs) {
      setMotivoEdicao("");
    }
  }, [currentOs]);

  const resetMaterialForm = () => {
    setCurrentMaterial(null);
    setMaterialForm({
      id: "",
      quantidade: 0,
      descricao_material: "",
      valor_unitario: 0,
      valor_total: 0
    });
  };

  const handleMaterialChange = (field: string, value: any) => {
    setMaterialForm(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'quantidade' || field === 'valor_unitario') {
        const quantidade = field === 'quantidade' ? value : prev.quantidade;
        const valorUnitario = field === 'valor_unitario' ? value : prev.valor_unitario;
        updated.valor_total = quantidade * valorUnitario;
      }
      
      return updated;
    });
  };

  const handleOpenMaterialForm = (material?: Material) => {
    if (material) {
      setCurrentMaterial(material);
      setMaterialForm({
        id: material.id,
        quantidade: material.quantidade,
        descricao_material: material.descricao_material,
        valor_unitario: material.valor_unitario,
        valor_total: material.valor_total
      });
    } else {
      resetMaterialForm();
    }
    setMaterialFormOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (materialForm.quantidade <= 0 || !materialForm.descricao_material || materialForm.valor_unitario <= 0) {
      toast({
        title: "Campos inválidos",
        description: "Por favor preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }

    if (!currentOs) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar a OS atual.",
        variant: "destructive"
      });
      return;
    }

    try {
      const materialData: Partial<Material> = {
        ...materialForm,
        os_id: currentOs.id
      };

      // Don't send empty id for new records
      if (!materialData.id) {
        delete materialData.id;
      }

      console.log("Saving material with data:", materialData);

      await onSaveMaterial(materialData);
      
      resetMaterialForm();
      setMaterialFormOpen(false);
    } catch (error) {
      console.error("Error saving material:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o material.",
        variant: "destructive"
      });
    }
  };

  const resetLaborForm = () => {
    setCurrentLabor(null);
    setLaborForm({
      id: "",
      quantidade: 0,
      funcao: "",
      valor_unitario: 0,
      valor_total: 0
    });
  };

  const handleLaborChange = (field: string, value: any) => {
    setLaborForm(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'quantidade' || field === 'valor_unitario') {
        const quantidade = field === 'quantidade' ? value : prev.quantidade;
        const valorUnitario = field === 'valor_unitario' ? value : prev.valor_unitario;
        updated.valor_total = quantidade * valorUnitario;
      }
      
      return updated;
    });
  };

  const handleOpenLaborForm = (labor?: MaoDeObra) => {
    if (labor) {
      setCurrentLabor(labor);
      setLaborForm({
        id: labor.id,
        quantidade: labor.quantidade,
        funcao: labor.funcao,
        valor_unitario: labor.valor_unitario,
        valor_total: labor.valor_total
      });
    } else {
      resetLaborForm();
    }
    setLaborFormOpen(true);
  };

  const handleSaveLabor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (laborForm.quantidade <= 0 || !laborForm.funcao || laborForm.valor_unitario <= 0) {
      toast({
        title: "Campos inválidos",
        description: "Por favor preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }

    if (!currentOs) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar a OS atual.",
        variant: "destructive"
      });
      return;
    }

    try {
      const laborData: Partial<MaoDeObra> = {
        ...laborForm,
        os_id: currentOs.id
      };

      // Don't send empty id for new records
      if (!laborData.id) {
        delete laborData.id;
      }

      console.log("Saving labor with data:", laborData);

      await onSaveMaoDeObra(laborData);
      
      resetLaborForm();
      setLaborFormOpen(false);
    } catch (error) {
      console.error("Error saving labor:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a mão de obra.",
        variant: "destructive"
      });
    }
  };

  const handleFinishOsClick = () => {
    if (!currentOs) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar a OS atual.",
        variant: "destructive"
      });
      return;
    }
    onFinishOs(currentOs.id);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {currentOs ? `Editar Ordem de Serviço #${currentOs.numero_chamado}` : "Nova Ordem de Serviço"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para {currentOs ? "editar" : "criar"} uma ordem de serviço.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cabecalho">Cabeçalho</TabsTrigger>
            <TabsTrigger value="solicitacao">Solicitação</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="mao-de-obra">Mão de Obra</TabsTrigger>
            <TabsTrigger value="balanceamento">Balanceamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cabecalho" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero_chamado">Número do Chamado</Label>
                <Input
                  type="text"
                  id="numero_chamado"
                  defaultValue={currentOs?.numero_chamado || "Gerado automaticamente"}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Input
                  type="text"
                  id="status"
                  defaultValue={currentOs?.status}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Input
                  type="text"
                  id="prioridade"
                  defaultValue={currentOs?.prioridade}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="data_solicitacao">Data de Solicitação</Label>
                <Input
                  type="text"
                  id="data_solicitacao"
                  defaultValue={currentOs?.data_solicitacao ? format(new Date(currentOs.data_solicitacao), 'dd/MM/yyyy', { locale: ptBR }) : ''}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="solicitacao" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo_falha">Tipo de Falha</Label>
                <Input
                  type="text"
                  id="tipo_falha"
                  defaultValue={currentOs?.tipo_falha}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="caminhao_equipamento">Caminhão/Equipamento</Label>
                <Input
                  type="text"
                  id="caminhao_equipamento"
                  defaultValue={currentOs?.caminhao_equipamento?.placa}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="solicitante">Solicitante</Label>
                <Input
                  type="text"
                  id="solicitante"
                  defaultValue={currentOs?.solicitante?.nome_completo || currentOs?.solicitante?.email}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="centro_custo">Centro de Custo</Label>
                <Input
                  type="text"
                  id="centro_custo"
                  defaultValue={currentOs?.centro_custo?.nome_centro_custo}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="descricao_problema">Descrição do Problema</Label>
              <Textarea
                id="descricao_problema"
                defaultValue={currentOs?.descricao_problema}
                readOnly
                className="bg-muted/50"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="materiais" className="space-y-4 py-4">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Materiais Utilizados</h3>
              <Button 
                type="button" 
                size="sm"
                onClick={() => handleOpenMaterialForm()}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Material
              </Button>
            </div>
            
            {materials && materials.length > 0 ? (
              <Table className="border rounded-md overflow-hidden">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>{material.quantidade}</TableCell>
                      <TableCell>{material.descricao_material}</TableCell>
                      <TableCell>R$ {material.valor_unitario.toFixed(2)}</TableCell>
                      <TableCell>R$ {material.valor_total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenMaterialForm(material)}
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteMaterial(material.id)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-10 border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Nenhum material cadastrado.</p>
              </div>
            )}
            
            <Dialog open={materialFormOpen} onOpenChange={setMaterialFormOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {currentMaterial ? "Editar Material" : "Adicionar Material"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSaveMaterial}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantidade">Quantidade</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          min="0"
                          step="0.01"
                          value={materialForm.quantidade}
                          onChange={(e) => handleMaterialChange('quantidade', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="valor_unitario">Valor Unitário (R$)</Label>
                        <Input
                          id="valor_unitario"
                          type="number"
                          min="0"
                          step="0.01"
                          value={materialForm.valor_unitario}
                          onChange={(e) => handleMaterialChange('valor_unitario', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="descricao_material">Descrição do Material</Label>
                      <Input
                        id="descricao_material"
                        value={materialForm.descricao_material}
                        onChange={(e) => handleMaterialChange('descricao_material', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="valor_total">Valor Total</Label>
                      <div className="flex items-center">
                        <span className="mr-1">R$</span>
                        <Input
                          id="valor_total"
                          type="number"
                          value={materialForm.valor_total}
                          readOnly
                          className="bg-muted/50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setMaterialFormOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Adicionar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="mao-de-obra" className="space-y-4 py-4">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Mão de Obra</h3>
              <Button 
                type="button" 
                size="sm"
                onClick={() => handleOpenLaborForm()}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Mão de Obra
              </Button>
            </div>
            
            {laborItems && laborItems.length > 0 ? (
              <Table className="border rounded-md overflow-hidden">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {laborItems.map((labor) => (
                    <TableRow key={labor.id}>
                      <TableCell>{labor.quantidade}</TableCell>
                      <TableCell>{labor.funcao}</TableCell>
                      <TableCell>R$ {labor.valor_unitario.toFixed(2)}</TableCell>
                      <TableCell>R$ {labor.valor_total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenLaborForm(labor)}
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteMaoDeObra(labor.id)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-10 border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Nenhuma mão de obra cadastrada.</p>
              </div>
            )}
            
            <Dialog open={laborFormOpen} onOpenChange={setLaborFormOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {currentLabor ? "Editar Mão de Obra" : "Adicionar Mão de Obra"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSaveLabor}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantidade">Quantidade</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          min="0"
                          step="0.01"
                          value={laborForm.quantidade}
                          onChange={(e) => handleLaborChange('quantidade', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="valor_unitario">Valor Unitário (R$)</Label>
                        <Input
                          id="valor_unitario"
                          type="number"
                          min="0"
                          step="0.01"
                          value={laborForm.valor_unitario}
                          onChange={(e) => handleLaborChange('valor_unitario', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="funcao">Função</Label>
                      <Input
                        id="funcao"
                        value={laborForm.funcao}
                        onChange={(e) => handleLaborChange('funcao', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="valor_total">Valor Total</Label>
                      <div className="flex items-center">
                        <span className="mr-1">R$</span>
                        <Input
                          id="valor_total"
                          type="number"
                          value={laborForm.valor_total}
                          readOnly
                          className="bg-muted/50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setLaborFormOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Adicionar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="balanceamento" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio_atendimento">Data de Início do Atendimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full pl-3 text-left font-normal"
                    >
                      {currentOs?.data_inicio_atendimento ? (
                        format(new Date(currentOs.data_inicio_atendimento), "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={currentOs?.data_inicio_atendimento ? new Date(currentOs.data_inicio_atendimento) : undefined}
                      onSelect={(date) => {}}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="hora_inicio_atendimento">Hora de Início do Atendimento</Label>
                <Input
                  type="time"
                  id="hora_inicio_atendimento"
                  defaultValue={currentOs?.hora_inicio_atendimento}
                />
              </div>
              <div>
                <Label htmlFor="data_fim_atendimento">Data de Fim do Atendimento</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full pl-3 text-left font-normal"
                    >
                      {currentOs?.data_fim_atendimento ? (
                        format(new Date(currentOs.data_fim_atendimento), "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={currentOs?.data_fim_atendimento ? new Date(currentOs.data_fim_atendimento) : undefined}
                      onSelect={(date) => {}}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="hora_fim_atendimento">Hora de Fim do Atendimento</Label>
                <Input
                  type="time"
                  id="hora_fim_atendimento"
                  defaultValue={currentOs?.hora_fim_atendimento}
                />
              </div>
              <div>
                <Label htmlFor="horimetro_km_inicial">Horímetro/KM Inicial</Label>
                <Input
                  type="number"
                  id="horimetro_km_inicial"
                  defaultValue={currentOs?.horimetro_km_inicial}
                />
              </div>
              <div>
                <Label htmlFor="horimetro_km_final">Horímetro/KM Final</Label>
                <Input
                  type="number"
                  id="horimetro_km_final"
                  defaultValue={currentOs?.horimetro_km_final}
                />
              </div>
              <div>
                <Label htmlFor="duracao_servico">Duração do Serviço</Label>
                <Input
                  type="text"
                  id="duracao_servico"
                  defaultValue={currentOs?.duracao_servico}
                />
              </div>
              <div>
                <Label htmlFor="setor">Setor</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentosOptions.map((departamento) => (
                      <SelectItem key={departamento.id} value={departamento.id}>
                        {departamento.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="anotacoes_internas">Anotações Internas</Label>
              <Textarea
                id="anotacoes_internas"
                defaultValue={currentOs?.anotacoes_internas}
              />
            </div>
            <div>
              <Label htmlFor="tratativa">Tratativa</Label>
              <Textarea
                id="tratativa"
                defaultValue={currentOs?.tratativa}
              />
            </div>
          </TabsContent>
          
        </Tabs>
        
        <DialogFooter>
          <Textarea 
            placeholder="Motivo da edição"
            value={motivoEdicao}
            onChange={(e) => setMotivoEdicao(e.target.value)}
            className="w-1/2 mr-2"
          />
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {currentOs?.status !== 'Concluída' ? (
            <>
              <Button type="button" onClick={() => onGeneratePdf(currentOs.id)}>
                <FileDown className="h-4 w-4 mr-2" />
                Gerar PDF
              </Button>
              <Button type="button" onClick={handleFinishOsClick}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar OS
              </Button>
              <Button type="submit" onClick={() => onSubmit({ status: 'Em Andamento' }, motivoEdicao)}>
                Salvar
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => onGeneratePdf(currentOs.id)}>
              <FileDown className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OsForm;
