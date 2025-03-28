import HttpClient from '@/lib/Http';

// Account API response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  banner: string | null;
  description: string | null;
  google_id: boolean;
  last_seen: string;
}

export class AccountClient {
  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ApiResponse<UserProfile>> {
    return HttpClient.get<ApiResponse<UserProfile>>('/api/account');
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: FormData): Promise<ApiResponse<UserProfile>> {
    return HttpClient.post<ApiResponse<UserProfile>>('/api/account/update', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Update user password
   */
  static async updatePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse<null>> {
    return HttpClient.post<ApiResponse<null>>('/api/account/update-password', data);
  }

  /**
   * Remove user avatar
   */
  static async removeAvatar(): Promise<ApiResponse<UserProfile>> {
    return HttpClient.post<ApiResponse<UserProfile>>('/api/account/remove-avatar');
  }

  /**
   * Remove user banner
   */
  static async removeBanner(): Promise<ApiResponse<UserProfile>> {
    return HttpClient.post<ApiResponse<UserProfile>>('/api/account/remove-banner');
  }

  /**
   * Delete user account
   */
  static async deleteAccount(data: {
    password: string;
  }): Promise<ApiResponse<null>> {
    return HttpClient.post<ApiResponse<null>>('/api/account/delete', data);
  }
}

export default AccountClient;