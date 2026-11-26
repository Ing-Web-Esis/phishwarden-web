import { apiClient } from '@/lib/api-client';
import type {
  CompanyDetail,
  UpdateCompanyInput,
  RegenerateAccessCodeResponse,
  RegisterCompanyInput,
  RegisterCompanyResponse,
} from '@/lib/types';

export const companyService = {
  registerCompany: (data: RegisterCompanyInput) =>
    apiClient.post<RegisterCompanyResponse>('/empresas/register', data),

  getCompany: (empresaId: number) =>
    apiClient.get<CompanyDetail>(`/empresas/${empresaId}`),

  updateCompany: (empresaId: number, data: UpdateCompanyInput) =>
    apiClient.patch<CompanyDetail>(`/empresas/${empresaId}`, data),

  regenerateAccessCode: (empresaId: number) =>
    apiClient.post<RegenerateAccessCodeResponse>(
      `/empresas/${empresaId}/regenerar-codigo`,
    ),
};
