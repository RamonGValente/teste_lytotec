
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Funcionario, FuncionarioFormData } from "@/types/funcionario";
import { 
  normalizeDateToBrazilianNoon, 
  formatBrazilianDateToString, 
  getCurrentBrazilianDate 
} from "@/utils/timezoneUtils";

const funcionarioSchema = z.object({
  nome_completo: z.string().min(1, { message: "Nome completo é obrigatório" }),
  cpf: z.string().optional(),
  data_nascimento: z.string().nullable().optional(),
  genero: z.string().optional(),
  escolaridade: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  endereco_completo: z.string().optional(),
  funcao_id: z.string().optional(),
  departamento_id: z.string().optional(),
  empresa_id: z.string().optional(),
  centro_custo_id: z.string().optional(),
  data_admissao: z.string().nullable().optional(),
  salario_base: z.number().min(0, { message: "Salário deve ser positivo" }).optional(),
  data_ferias: z.string().nullable().optional(),
  status: z.string().optional(),
  data_demissao: z.string().nullable().optional(),
  insalubridade: z.number().min(0, { message: "Valor deve ser positivo" }).optional(),
  periculosidade: z.number().min(0, { message: "Valor deve ser positivo" }).optional(),
  gratificacao: z.number().min(0, { message: "Valor deve ser positivo" }).optional(),
  adicional_noturno: z.number().min(0, { message: "Valor deve ser positivo" }).optional(),
  custo_passagem: z.number().min(0, { message: "Valor deve ser positivo" }).optional(),
  refeicao: z.number().min(0, { message: "Valor deve ser positivo" }).optional(),
  diarias: z.number().min(0, { message: "Valor deve ser positivo" }).optional(),
  equipe_id: z.string().optional(),
});

export type FuncionarioFormSchema = z.infer<typeof funcionarioSchema>;

export const useFuncionarioForm = (
  funcionario: Funcionario | null,
  isOpen: boolean
) => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pessoal");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<FuncionarioFormData>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: {
      nome_completo: "",
      cpf: "",
      data_nascimento: null,
      genero: "",
      escolaridade: "",
      email: "",
      endereco_completo: "",
      funcao_id: "",
      departamento_id: "",
      empresa_id: "",
      centro_custo_id: "",
      equipe_id: "",
      data_admissao: null,
      salario_base: undefined,
      data_ferias: null,
      status: "Ativo",
      data_demissao: null,
      insalubridade: undefined,
      periculosidade: undefined,
      gratificacao: undefined,
      adicional_noturno: undefined,
      custo_passagem: undefined,
      refeicao: undefined,
      diarias: undefined,
    },
  });

  useEffect(() => {
    if (funcionario) {
      form.reset({
        nome_completo: funcionario.nome_completo || "",
        cpf: funcionario.cpf || "",
        data_nascimento: funcionario.data_nascimento || null,
        genero: funcionario.genero || "",
        escolaridade: funcionario.escolaridade || "",
        email: funcionario.email || "",
        endereco_completo: funcionario.endereco_completo || "",
        funcao_id: funcionario.funcao_id || "",
        departamento_id: funcionario.departamento_id || "",
        empresa_id: funcionario.empresa_id || "",
        centro_custo_id: funcionario.centro_custo_id || "",
        equipe_id: funcionario.equipe_id || "",
        data_admissao: funcionario.data_admissao || null,
        salario_base: funcionario.salario_base || undefined,
        data_ferias: funcionario.data_ferias || null,
        status: funcionario.status || "Ativo",
        data_demissao: funcionario.data_demissao || null,
        insalubridade: funcionario.insalubridade || undefined,
        periculosidade: funcionario.periculosidade || undefined,
        gratificacao: funcionario.gratificacao || undefined,
        adicional_noturno: funcionario.adicional_noturno || undefined,
        custo_passagem: funcionario.custo_passagem || undefined,
        refeicao: funcionario.refeicao || undefined,
        diarias: funcionario.diarias || undefined,
      });
      setUploadedImageUrl(funcionario.foto_url || null);
      setImagePreview(funcionario.foto_url || null);
    } else {
      const hoje = getCurrentBrazilianDate();
      form.setValue("data_admissao", hoje);
    }
  }, [funcionario, form]);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("pessoal");
    }
  }, [isOpen]);

  return {
    form,
    uploadedImageUrl,
    setUploadedImageUrl,
    activeTab,
    setActiveTab,
    imagePreview,
    setImagePreview,
    imageFile,
    setImageFile,
    isUploadingImage,
    setIsUploadingImage,
  };
};
