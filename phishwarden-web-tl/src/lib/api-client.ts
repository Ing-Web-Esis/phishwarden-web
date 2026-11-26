export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public override message: string,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipAuth = false, headers: customHeaders, body, ...fetchConfig } = options;

  // Construcción de URL y query parameters
  const cleanBase = BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${cleanBase}${cleanEndpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Configuración de encabezados
  const headers = new Headers(customHeaders);

  // Inyección de Token Bearer si no se omite autenticación
  if (!skipAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let finalBody: BodyInit | undefined;

  // Detección de FormData vs JSON
  if (body !== undefined && body !== null) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      finalBody = body;
      // No definir Content-Type para permitir boundary automático multipart
    } else if (typeof body === 'string') {
      finalBody = body;
    } else {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      finalBody = JSON.stringify(body);
    }
  }

  const response = await fetch(url.toString(), {
    ...fetchConfig,
    headers,
    body: finalBody,
  });

  // Lectura segura del texto para evitar fallos en DELETE / 204 No Content
  const text = await response.text();
  let data: Record<string, unknown> | null = null;
  if (text && text.trim() !== '') {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = response.statusText || `Error ${response.status}`;
    let errorsList: string[] | undefined;

    if (data && typeof data === 'object' && 'message' in data) {
      const msg = data.message;
      if (Array.isArray(msg)) {
        errorsList = msg.map((item) => String(item));
        errorMessage = errorsList.join(', ');
      } else if (typeof msg === 'string') {
        errorMessage = msg;
      }
    }

    // Manejo de 401 sin interrumpir /login ni rutas públicas de simulación /sim/*
    if (
      response.status === 401 &&
      !skipAuth &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login' &&
      !window.location.pathname.startsWith('/sim/')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('empresaId');
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }

    throw new ApiError(response.status, errorMessage, errorsList);
  }

  return (data as T) ?? (null as unknown as T);
}

// Métodos auxiliares
apiClient.get = <T>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'GET' });

apiClient.post = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'POST', body });

apiClient.put = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'PUT', body });

apiClient.patch = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'PATCH', body });

apiClient.delete = <T>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'DELETE' });
