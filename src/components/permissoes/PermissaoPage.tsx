
import React from "react";
import { UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissao } from "@/hooks/usePermissao";
import PermissaoHeaderActions from "./PermissaoHeaderActions";
import PermissaoTable from "./PermissaoTable";
import FuncaoPermissaoTable from "./FuncaoPermissaoTable";
import UserProfilesTable from "./UserProfilesTable";
import PermissaoFormModal from "./PermissaoFormModal";
import FuncaoPermissaoFormModal from "./FuncaoPermissaoFormModal";
import AssignPermissionModal from "./AssignPermissionModal";
import UserDetailsModal from "./UserDetailsModal";
import DeletePermissaoDialog from "./DeletePermissaoDialog";
import DeleteFuncaoPermissaoDialog from "./DeleteFuncaoPermissaoDialog";

const PermissaoPage: React.FC = () => {
  const {
    // Estados
    isPermissaoFormOpen,
    isFuncaoFormOpen,
    isDeletePermissaoOpen,
    isDeleteFuncaoPermissaoOpen,
    currentPermissao,
    currentFuncaoPermissao,
    permissaoFilter,
    funcaoPermissaoFilter,
    isPermissaoLoading,
    isFuncaoPermissaoLoading,
    permissoes,
    funcoesPermissao,
    allPermissoes,
    isSubmitting,
    isDeleting,
    
    // Novos estados para usuários
    isAssignPermissionOpen,
    isUserDetailsOpen,
    currentProfile,
    profileFilter,
    profiles,
    isProfilesLoading,
    availableFunctions, // Nova propriedade
    
    // Ações
    setIsPermissaoFormOpen,
    setIsFuncaoFormOpen,
    setIsDeletePermissaoOpen,
    setIsDeleteFuncaoPermissaoOpen,
    handlePermissaoFilterChange,
    handleFuncaoPermissaoFilterChange,
    resetPermissaoFilters,
    resetFuncaoPermissaoFilters,
    openPermissaoForm,
    openFuncaoPermissaoForm,
    confirmDeletePermissao,
    confirmDeleteFuncaoPermissao,
    handleDeletePermissao,
    handleDeleteFuncaoPermissao,
    handleSavePermissao,
    handleSaveFuncaoPermissao,
    refetchPermissoes,
    refetchFuncoesPermissao,

    // Novas ações para usuários
    setIsAssignPermissionOpen,
    setIsUserDetailsOpen,
    handleProfileFilterChange,
    resetProfileFilters,
    openAssignPermission,
    openUserDetails,
    handleAssignPermission,
  } = usePermissao();

  // Buscar nome da função de permissão para exibir nos detalhes
  const getFuncaoPermissaoNome = (funcaoPermissaoId: string | null) => {
    if (!funcaoPermissaoId || !funcoesPermissao) return undefined;
    const funcao = funcoesPermissao.find(f => f.id === funcaoPermissaoId);
    return funcao?.nome_funcao;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Gestão de Permissões</h1>
        </div>
        
        <PermissaoHeaderActions 
          onNewPermissao={() => openPermissaoForm()}
          onNewFuncaoPermissao={() => openFuncaoPermissaoForm()}
        />
      </div>
      
      <Tabs defaultValue="permissions" className="w-full">
        <TabsList>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="roles">Funções e Permissões</TabsTrigger>
          <TabsTrigger value="users">Usuários Cadastrados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="permissions" className="space-y-4">
          <PermissaoTable 
            permissoes={permissoes || []}
            isLoading={isPermissaoLoading}
            onEdit={openPermissaoForm}
            onDelete={confirmDeletePermissao}
            filters={permissaoFilter}
            onFilterChange={handlePermissaoFilterChange}
            onResetFilters={resetPermissaoFilters}
          />
        </TabsContent>
        
        <TabsContent value="roles" className="space-y-4">
          <FuncaoPermissaoTable 
            funcoesPermissao={funcoesPermissao || []}
            isLoading={isFuncaoPermissaoLoading}
            onEdit={openFuncaoPermissaoForm}
            onDelete={confirmDeleteFuncaoPermissao}
            filters={funcaoPermissaoFilter}
            onFilterChange={handleFuncaoPermissaoFilterChange}
            onResetFilters={resetFuncaoPermissaoFilters}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserProfilesTable 
            profiles={profiles || []}
            isLoading={isProfilesLoading}
            onAssignPermission={openAssignPermission}
            onEditPermission={openAssignPermission}
            onViewDetails={openUserDetails}
            filters={profileFilter}
            onFilterChange={handleProfileFilterChange}
            onResetFilters={resetProfileFilters}
          />
        </TabsContent>
      </Tabs>
      
      {/* Modais existentes */}
      <PermissaoFormModal
        isOpen={isPermissaoFormOpen}
        onClose={() => setIsPermissaoFormOpen(false)}
        permissao={currentPermissao}
        onSubmit={handleSavePermissao}
        isSubmitting={isSubmitting}
      />
      
      <FuncaoPermissaoFormModal
        isOpen={isFuncaoFormOpen}
        onClose={() => setIsFuncaoFormOpen(false)}
        funcaoPermissao={currentFuncaoPermissao}
        permissoes={allPermissoes || []}
        onSubmit={handleSaveFuncaoPermissao}
        isSubmitting={isSubmitting}
      />

      {/* Novos modais para usuários */}
      <AssignPermissionModal
        isOpen={isAssignPermissionOpen}
        onClose={() => setIsAssignPermissionOpen(false)}
        profile={currentProfile}
        availableFunctions={availableFunctions || []}
        onAssign={handleAssignPermission}
        isSubmitting={isSubmitting}
      />

      <UserDetailsModal
        isOpen={isUserDetailsOpen}
        onClose={() => setIsUserDetailsOpen(false)}
        profile={currentProfile}
      />
      
      <DeletePermissaoDialog
        isOpen={isDeletePermissaoOpen}
        onClose={() => setIsDeletePermissaoOpen(false)}
        onConfirm={handleDeletePermissao}
        permissaoId={currentPermissao?.id}
        permissaoNome={currentPermissao?.nome_permissao}
        isDeleting={isDeleting}
      />
      
      <DeleteFuncaoPermissaoDialog
        isOpen={isDeleteFuncaoPermissaoOpen}
        onClose={() => setIsDeleteFuncaoPermissaoOpen(false)}
        onConfirm={handleDeleteFuncaoPermissao}
        funcaoPermissaoId={currentFuncaoPermissao?.id}
        funcaoPermissaoNome={currentFuncaoPermissao?.nome_funcao}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PermissaoPage;
