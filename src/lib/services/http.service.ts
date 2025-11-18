import type { ErrorResponse } from '$lib/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
	throw new Error('API_BASE_URL is not defined');
}

export class HttpService {
	protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(options.headers as Record<string, string>)
		};

		const token = this.getAuthToken();
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers
		});

		if (!response.ok) {
			let errorMessage = 'An error occurred';
			try {
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					const error: ErrorResponse = await response.json();
					errorMessage = error.error || errorMessage;
				} else {
					errorMessage = `${response.status} ${response.statusText}`;
				}
			} catch {
				errorMessage = `${response.status} ${response.statusText}`;
			}
			throw new Error(errorMessage);
		}

		return response.json();
	}

	protected getAuthToken(): string | null {
		return null;
	}
}
