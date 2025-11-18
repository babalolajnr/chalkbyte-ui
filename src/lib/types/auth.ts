export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	role: 'admin' | 'teacher' | 'student';
	school_id: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	access_token?: string;
	user?: User;
	mfa_required?: boolean;
	temp_token?: string;
}

export interface MFAVerifyRequest {
	code: string;
	temp_token: string;
}

export interface MFAVerifyResponse {
	access_token: string;
	user: User;
}

export interface RecoveryCodeRequest {
	recovery_code: string;
	temp_token: string;
}

export interface RecoveryCodeResponse {
	access_token: string;
	user: User;
}

export interface PasswordResetRequest {
	email: string;
}

export interface PasswordResetResponse {
	message: string;
}

export interface PasswordResetConfirmRequest {
	token: string;
	new_password: string;
}

export interface PasswordResetConfirmResponse {
	message: string;
}

export interface MFAEnableResponse {
	qr_code_url: string;
	secret: string;
	manual_entry_key: string;
}

export interface MFAVerifySetupRequest {
	code: string;
}

export interface MFAVerifySetupResponse {
	recovery_codes: string[];
}

export interface MFADisableRequest {
	password: string;
}

export interface MFADisableResponse {
	message: string;
}

export interface MFAStatusResponse {
	mfa_enabled: boolean;
}

export interface MFARegenerateCodesResponse {
	recovery_codes: string[];
}

export interface ErrorResponse {
	error: string;
}

export interface AuthState {
	user: User | null;
	accessToken: string | null;
	isAuthenticated: boolean;
	tempToken: string | null;
	mfaRequired: boolean;
}
