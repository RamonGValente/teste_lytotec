import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Eye, Upload, Image, FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnexoImagem {
  id: string;
  file: File;
  url: string;
  legenda: string;
}

interface AnexoPDF {
  id: string;
  file: File;
  nome: string;
}

const RelatorioAplicacaoAnexos: React.FC = () => {
  const [imagens, setImagens] = useState<AnexoImagem[]>([]);
  const [pdfs, setPdfs] = useState<AnexoPDF[]>([]);
  const { toast } = useToast();

  const adicionarImagem = (files: FileList | null) => {
    if (!files) return;

    const novosArquivos = Array.from(files);
    
    // Validar limite de 9 imagens
    if (imagens.length + novosArquivos.length > 9) {
      toast({
        title: "Limite excedido",
        description: "É possível anexar no máximo 9 imagens",
        variant: "destructive"
      });
      return;
    }

    // Validar tipos de arquivo
    const arquivosValidos = novosArquivos.filter(file => 
      file.type.startsWith('image/')
    );

    if (arquivosValidos.length !== novosArquivos.length) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas imagens são permitidas",
        variant: "destructive"
      });
    }

    // Criar URLs para preview
    const novasImagens: AnexoImagem[] = arquivosValidos.map(file => ({
      id: Date.now().toString() + Math.random().toString(36),
      file,
      url: URL.createObjectURL(file),
      legenda: ''
    }));

    setImagens(prev => [...prev, ...novasImagens]);
  };

  const adicionarPDF = (files: FileList | null) => {
    if (!files) return;

    const novosArquivos = Array.from(files);
    
    // Validar limite de 6 PDFs
    if (pdfs.length + novosArquivos.length > 6) {
      toast({
        title: "Limite excedido",
        description: "É possível anexar no máximo 6 documentos PDF",
        variant: "destructive"
      });
      return;
    }

    // Validar tipos de arquivo
    const arquivosValidos = novosArquivos.filter(file => 
      file.type === 'application/pdf'
    );

    if (arquivosValidos.length !== novosArquivos.length) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas arquivos PDF são permitidos",
        variant: "destructive"
      });
    }

    // Criar lista de PDFs
    const novosPDFs: AnexoPDF[] = arquivosValidos.map(file => ({
      id: Date.now().toString() + Math.random().toString(36),
      file,
      nome: file.name
    }));

    setPdfs(prev => [...prev, ...novosPDFs]);
  };

  const removerImagem = (id: string) => {
    setImagens(prev => {
      const imagemRemovida = prev.find(img => img.id === id);
      if (imagemRemovida) {
        URL.revokeObjectURL(imagemRemovida.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const removerPDF = (id: string) => {
    setPdfs(prev => prev.filter(pdf => pdf.id !== id));
  };

  const atualizarLegenda = (id: string, legenda: string) => {
    setImagens(prev => prev.map(img => 
      img.id === id ? { ...img, legenda } : img
    ));
  };

  const visualizarImagem = (url: string) => {
    window.open(url, '_blank');
  };

  const visualizarPDF = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Anexos (Imagens e Documentos)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção de Imagens */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Imagens ({imagens.length}/9)
            </h3>
            <div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => adicionarImagem(e.target.files)}
                className="hidden"
                id="upload-imagens"
              />
              <Label htmlFor="upload-imagens" className="cursor-pointer">
                <Button asChild variant="outline" size="sm">
                  <span>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Imagens
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          {/* Grid de Imagens */}
          {imagens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {imagens.map((imagem) => (
                <Card key={imagem.id} className="p-4">
                  <div className="space-y-3">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={imagem.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Legenda da imagem..."
                        value={imagem.legenda}
                        onChange={(e) => atualizarLegenda(imagem.id, e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => visualizarImagem(imagem.url)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removerImagem(imagem.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma imagem anexada. Clique em "Adicionar Imagens" para começar.
              </p>
            </div>
          )}
        </div>

        {/* Seção de PDFs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documentos PDF ({pdfs.length}/6)
            </h3>
            <div>
              <Input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => adicionarPDF(e.target.files)}
                className="hidden"
                id="upload-pdfs"
              />
              <Label htmlFor="upload-pdfs" className="cursor-pointer">
                <Button asChild variant="outline" size="sm">
                  <span>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar PDFs
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          {/* Lista de PDFs */}
          {pdfs.length > 0 ? (
            <div className="space-y-2">
              {pdfs.map((pdf) => (
                <Card key={pdf.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="font-medium text-foreground">{pdf.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {(pdf.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => visualizarPDF(pdf.file)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removerPDF(pdf.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum documento PDF anexado. Clique em "Adicionar PDFs" para começar.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioAplicacaoAnexos;