
import { fetchVeiculos, getVeiculos, getVeiculoById } from './queries';
import { createVeiculo, updateVeiculo, deleteVeiculo } from './mutations';
import { importVeiculos, exportVeiculos } from './importExport';
import { getMarcasDropdown, getDepartamentosDropdown, getEmpresasDropdown } from './dropdowns';
import { VeiculoFilter } from './types';

export {
  fetchVeiculos,
  getVeiculos,
  getVeiculoById,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
  importVeiculos,
  exportVeiculos,
  getMarcasDropdown,
  getDepartamentosDropdown,
  getEmpresasDropdown,
};

// Re-export the VeiculoFilter type using export type
export type { VeiculoFilter };
