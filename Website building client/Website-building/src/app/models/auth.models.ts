export interface RegisterDto {// DTO לנתוני הרשמה — מועבר מהקומפוננטה לשירות
  fullName: string;
  email: string;
  password: string;
}

export interface LoginDto {// DTO לנתוני התחברות — מועבר מהקומפוננטה לשירות
  email: string;
  password: string;
}

export interface AuthResponseDto {// DTO לתגובה מהשרת אחרי הרשמה או התחברות
  token: string;
  isSuccess: boolean;
  message: string;
}
