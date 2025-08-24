import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApontamentoCaminhao, ApontamentoInspecao } from "@/services/apontamentoCaminhoesService";
import { ComboboxCaminhao } from "@/components/combobox/ComboboxCaminhao";
import { mapSituacaoToDatabase, mapSituacaoFromDatabase } from "@/utils/situacaoMapping";

interface ApontamentoCaminhoesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    apontamento: Partial<ApontamentoCaminhao>;
    inspecao?: Partial<ApontamentoInspecao>;
  }) => void;
  currentApontamento: {
    apontamento: ApontamentoCaminhao | null;
    inspecao: ApontamentoInspecao | null;
  };
  veiculosOptions: { id: string; label: string; situacao?: string }[];
  operadoresOptions: { id: string; label: string }[];
  centrosCustoOptions: { id: string; label: string }[];
  isLoading: boolean;
  currentUser: any;
  getUltimoHorimetro: (caminhaoId: string) => Promise<number | null>;
  uploadFoto: (file: File) => Promise<string>;
}

const ApontamentoCaminhoesForm: React.FC<ApontamentoCaminhoesFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentApontamento,
  veiculosOptions,
  operadoresOptions,
  centrosCustoOptions,
  isLoading,
  currentUser,
  getUltimoHorimetro,
  uploadFoto
}) => {
  const [activeTab, setActiveTab] = useState('dados');
  const [formData, setFormData] = useState<{
    apontamento: Partial<ApontamentoCaminhao>;
    inspecao: Partial<ApontamentoInspecao>;
  }>({
    apontamento: {},
    inspecao: {}
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>(""); // Track if it's a truck or equipment

  useEffect(() => {
    if (currentApontamento.apontamento) {
      console.log("Carregando apontamento existente:", currentApontamento.apontamento);
      
      // Map situacao from database to UI when loading existing data
      const mappedSituacao = currentApontamento.apontamento.situacao 
        ? mapSituacaoFromDatabase(currentApontamento.apontamento.situacao)
        : undefined;
      
      setFormData({
        apontamento: { 
          ...currentApontamento.apontamento,
          situacao: mappedSituacao
        },
        inspecao: currentApontamento.inspecao || {}
      });
      
      if (currentApontamento.apontamento.data) {
        setDate(new Date(currentApontamento.apontamento.data));
      }

      // Check vehicle type from the selected vehicle
      if (currentApontamento.apontamento.caminhao_equipamento_id) {
        const vehicle = veiculosOptions.find(v => v.id === currentApontamento.apontamento.caminhao_equipamento_id);
        setSelectedVehicleType(vehicle?.label.includes("Caminhão") ? "Caminhão" : "Equipamento");
      }
    } else {
      // Set current time for new records and ensure operator is current user
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      
      console.log("Inicializando novo apontamento com usuário:", currentUser);
      
      // Default inspecao fields to "OK" for new records
      setFormData({
        apontamento: {
          data: format(now, 'yyyy-MM-dd'),
          operador_id: currentUser?.id || '',
          hora_inicial: currentTime,
        },
        inspecao: {
          documentacao: "OK",
          tacografo: "OK",
          sistema_eletrico: "OK",
          nivel_oleo: "OK",
          nivel_agua: "OK",
          nivel_combustivel: "OK",
          drenagem_tanque_ar: "OK",
          material_rodante: "OK",
          cinto_seguranca: "OK",
          material_desgaste: "OK",
          estado_implementos: "OK",
          limpeza_interna: "OK",
          engate_reboque: "OK",
          estado_equipamentos: "OK",
          inspecao_veicular: "OK",
          material_amarracao: "OK"
        }
      });
      setDate(now);
    }
  }, [currentApontamento, currentUser, veiculosOptions, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    section: 'apontamento' | 'inspecao' = 'apontamento'
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: newValue
      }
    }));
  };

  const handleSelectChange = (
    value: string, 
    field: string, 
    section: 'apontamento' | 'inspecao' = 'apontamento'
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    if (field === 'caminhao_equipamento_id') {
      // Check vehicle type from the selected option
      const vehicle = veiculosOptions.find(v => v.id === value);
      const vehicleType = vehicle?.label.includes("Caminhão") ? "Caminhão" : "Equipamento";
      setSelectedVehicleType(vehicleType);
      
      fetchUltimoHorimetro(value);
    }
  };

  const fetchUltimoHorimetro = async (caminhaoId: string) => {
    if (!caminhaoId) return;
    
    try {
      const horimetro = await getUltimoHorimetro(caminhaoId);
      if (horimetro !== null) {
        setFormData(prev => ({
          ...prev,
          apontamento: {
            ...prev.apontamento,
            horimetro_inicial: horimetro
          }
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar último horímetro:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    try {
      const imageUrl = await uploadFoto(file);
      setUploadedImages(prev => [...prev, imageUrl]);
      
      setFormData(prev => ({
        ...prev,
        inspecao: {
          ...prev.inspecao,
          fotos_avarias: [...(prev.inspecao.fotos_avarias || []), imageUrl]
        }
      }));
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log("Iniciando salvamento do apontamento");
      console.log("Dados do formulário:", formData);
      console.log("Usuário atual:", currentUser);
      
      // Map situacao from UI to database before submitting
      const mappedSituacao = formData.apontamento.situacao 
        ? mapSituacaoToDatabase(formData.apontamento.situacao)
        : undefined;
      
      // Garantir que o operador_id seja sempre o usuário atual
      const submissionData = {
        apontamento: {
          ...formData.apontamento,
          data: date ? format(date, 'yyyy-MM-dd') : undefined,
          operador_id: currentUser?.id || formData.apontamento.operador_id,
          situacao: mappedSituacao
        },
        inspecao: formData.inspecao
      };
      
      console.log("Dados finais para envio:", submissionData);
      
      if (!submissionData.apontamento.operador_id) {
        throw new Error("Operador não identificado. Por favor, faça login novamente.");
      }
      
      if (!submissionData.apontamento.caminhao_equipamento_id) {
        throw new Error("Por favor, selecione um caminhão/equipamento.");
      }
      
      if (!submissionData.apontamento.situacao) {
        throw new Error("Por favor, selecione a situação do veículo.");
      }
      
      await onSubmit(submissionData);
      console.log("Apontamento salvo com sucesso");
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      // O erro será tratado pelo hook pai
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!currentApontamento.apontamento?.id;
  
  const handleDialogClose = () => {
    const hasChanges = Object.keys(formData.apontamento).length > 2 || 
                      Object.keys(formData.inspecao).length > 0;
                      
    if (hasChanges && !isSubmitting && !isEditing) {
      if (window.confirm("Deseja realmente cancelar? Todas as alterações serão perdidas.")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Get the correct label for horimetro or km
  const getHorimetroLabel = (isFinal = false) => {
    if (selectedVehicleType === "Caminhão") {
      return isFinal ? "Hodômetro Final (KM)" : "Hodômetro Inicial (KM)";
    }
    return isFinal ? "Horímetro Final" : "Horímetro Inicial";
  };

  // Get the current operator's name for display
  const getCurrentOperatorName = () => {
    if (currentUser) {
      return currentUser.email || 'Usuário Atual';
    }
    return 'Não identificado';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Apontamento' : 'Novo Apontamento'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite as informações do apontamento de caminhão/equipamento' 
              : 'Registre um novo apontamento de caminhões e equipamentos'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Tabs defaultValue="dados" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados Operacionais</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'dd/MM/yyyy') : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="operador_id">Operador</Label>
                  <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <span className="text-sm text-gray-700">
                      {getCurrentOperatorName()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    O operador é automaticamente definido como o usuário logado
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="caminhao_equipamento_id">Caminhão/Equipamento *</Label>
                  <div>
                    <Input
                      list="veiculosList"
                      placeholder="Digite para pesquisar"
                      value={
                        veiculosOptions.find(opt => opt.id === formData.apontamento.caminhao_equipamento_id)?.label || ''
                      }
                      onChange={(e) => {
                        const selected = veiculosOptions.find(opt => opt.label === e.target.value);
                        handleSelectChange(selected?.id || '', 'caminhao_equipamento_id');
                      }}
                      disabled={isEditing}
                    />
                    <datalist id="veiculosList">
                      {veiculosOptions.map((veiculo) => (
                        <option
                          key={veiculo.id}
                          value={veiculo.label}
                        />
                      ))}
                    </datalist>
                  </div>
                </div>

                
                <div className="space-y-2">
                  <Label htmlFor="centro_custo_id">Centro de Custo</Label>
                  <Select 
                    value={formData.apontamento.centro_custo_id || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'centro_custo_id')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o centro de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      {centrosCustoOptions.map(centro => (
                        <SelectItem key={centro.id} value={centro.id}>
                          {centro.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horimetro_inicial">{getHorimetroLabel()}</Label>
                  <Input
                    id="horimetro_inicial"
                    name="horimetro_inicial"
                    type="number"
                    step="0.01"
                    value={formData.apontamento.horimetro_inicial || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horimetro_final">{getHorimetroLabel(true)}</Label>
                  <Input
                    id="horimetro_final"
                    name="horimetro_final"
                    type="number"
                    step="0.01"
                    value={formData.apontamento.horimetro_final || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hora_inicial">Hora Inicial</Label>
                  <Input
                    id="hora_inicial"
                    name="hora_inicial"
                    type="time"
                    value={formData.apontamento.hora_inicial || ''}
                    onChange={handleInputChange}
                    disabled={isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hora_final">Hora Final</Label>
                  <Input
                    id="hora_final"
                    name="hora_final"
                    type="time"
                    value={formData.apontamento.hora_final || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="situacao">Situação *</Label>
                  <Select 
                    value={formData.apontamento.situacao || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'situacao')}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operando">Operando</SelectItem>
                      <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                      <SelectItem value="Parado">Parado</SelectItem>
                      <SelectItem value="Intempérie">Intempérie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="abastecimento">Abastecimento (litros)</Label>
                  <Input
                    id="abastecimento"
                    name="abastecimento"
                    type="number"
                    step="0.01"
                    value={formData.apontamento.abastecimento || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                
                {isEditing ? (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab('checklist')}
                  >
                    Próximo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="checklist" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentacao">Documentação</Label>
                  <Select 
                    value={formData.inspecao.documentacao || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'documentacao', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tacografo">Tacógrafo</Label>
                  <Select 
                    value={formData.inspecao.tacografo || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'tacografo', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sistema_eletrico">Sistema Elétrico</Label>
                  <Select 
                    value={formData.inspecao.sistema_eletrico || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'sistema_eletrico', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nivel_oleo">Nível Óleo</Label>
                  <Select 
                    value={formData.inspecao.nivel_oleo || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'nivel_oleo', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nivel_agua">Nível Água</Label>
                  <Select 
                    value={formData.inspecao.nivel_agua || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'nivel_agua', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nivel_combustivel">Nível Combustível</Label>
                  <Select 
                    value={formData.inspecao.nivel_combustivel || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'nivel_combustivel', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="drenagem_tanque_ar">Drenagem Tanque de Ar</Label>
                  <Select 
                    value={formData.inspecao.drenagem_tanque_ar || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'drenagem_tanque_ar', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="material_rodante">Material Rodante</Label>
                  <Select 
                    value={formData.inspecao.material_rodante || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'material_rodante', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cinto_seguranca">Cinto de Segurança</Label>
                  <Select 
                    value={formData.inspecao.cinto_seguranca || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'cinto_seguranca', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="material_desgaste">Material de Desgaste</Label>
                  <Select 
                    value={formData.inspecao.material_desgaste || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'material_desgaste', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estado_implementos">Estado dos Implementos</Label>
                  <Select 
                    value={formData.inspecao.estado_implementos || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'estado_implementos', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="limpeza_interna">Limpeza Interna</Label>
                  <Select 
                    value={formData.inspecao.limpeza_interna || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'limpeza_interna', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="engate_reboque">Engate de Reboque</Label>
                  <Select 
                    value={formData.inspecao.engate_reboque || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'engate_reboque', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estado_equipamentos">Estado dos Equipamentos</Label>
                  <Select 
                    value={formData.inspecao.estado_equipamentos || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'estado_equipamentos', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inspecao_veicular">Inspeção Veicular</Label>
                  <Select 
                    value={formData.inspecao.inspecao_veicular || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'inspecao_veicular', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="material_amarracao">Material de Amarração</Label>
                  <Select 
                    value={formData.inspecao.material_amarracao || ''} 
                    onValueChange={(value) => handleSelectChange(value, 'material_amarracao', 'inspecao')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Não OK">Não OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="anotacoes">Anotações</Label>
                  <Input
                    id="anotacoes"
                    name="anotacoes"
                    value={formData.inspecao.anotacoes || ''}
                    onChange={(e) => handleInputChange(e, 'inspecao')}
                    placeholder="Observações adicionais"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fotos">Fotos de Avarias (opcional)</Label>
                  <Input
                    id="fotos"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square">
                          <img 
                            src={img} 
                            alt={`Avaria ${idx + 1}`} 
                            className="w-full h-full object-cover rounded" 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab('dados')}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancelar
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApontamentoCaminhoesForm;
