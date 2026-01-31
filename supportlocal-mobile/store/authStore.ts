import { create } from 'zustand';
import { api, ApiError } from '../services/api';
import { ENDPOINTS } from '../constants/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  updateDeliveryAddress: (data: Record<string, string | number | null>) => Promise<boolean>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user: User;
  token: string;
}

interface UserResponse {
  success: boolean;
  user: User;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
        device_name: 'mobile-app',
      });

      if (response.success && response.token) {
        await api.setToken(response.token);
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false, error: response.message || 'Login failed' });
      return false;
    } catch (error) {
      const message = error instanceof ApiError
        ? error.getFirstError()
        : 'Login failed. Please try again.';

      set({ isLoading: false, error: message });
      return false;
    }
  },

  register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post<LoginResponse>(ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role: 'buyer',
      });

      if (response.success && response.token) {
        await api.setToken(response.token);
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false, error: response.message || 'Registration failed' });
      return false;
    } catch (error) {
      const message = error instanceof ApiError
        ? error.getFirstError()
        : 'Registration failed. Please try again.';

      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore logout errors
    }

    await api.removeToken();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  fetchUser: async () => {
    const token = await api.getToken();

    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const response = await api.get<UserResponse>(ENDPOINTS.AUTH.USER);

      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        await api.removeToken();
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      await api.removeToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.put<UserResponse>(ENDPOINTS.AUTH.USER, data);

      if (response.success && response.user) {
        set({ user: response.user, isLoading: false });
        return true;
      }

      set({ isLoading: false, error: 'Failed to update profile' });
      return false;
    } catch (error) {
      const message = error instanceof ApiError
        ? error.getFirstError()
        : 'Failed to update profile';

      set({ isLoading: false, error: message });
      return false;
    }
  },

  updateDeliveryAddress: async (data: Record<string, string | number | null>) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.put<UserResponse>(
        ENDPOINTS.AUTH.UPDATE_DELIVERY_ADDRESS,
        data
      );

      if (response.success && response.user) {
        set({ user: response.user, isLoading: false });
        return true;
      }

      set({ isLoading: false, error: 'Failed to update address' });
      return false;
    } catch (error) {
      const message = error instanceof ApiError
        ? error.getFirstError()
        : 'Failed to update address';

      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User | null) => set({
    user,
    isAuthenticated: !!user,
  }),
}));
