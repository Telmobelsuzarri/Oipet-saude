/**
 * Notification Slice - Gerenciamento de notificações
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationService } from '@/services/NotificationService';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'general' | 'health' | 'medication' | 'feeding' | 'activity' | 'system';
  isRead: boolean;
  data?: any;
  createdAt: string;
  readAt?: string;
}

interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  todayCount: number;
  categoryStats: {
    general: number;
    health: number;
    medication: number;
    feeding: number;
    activity: number;
    system: number;
  };
  typeStats: {
    info: number;
    success: number;
    warning: number;
    error: number;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadNotifications: Notification[];
  stats: NotificationStats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadNotifications: [],
  stats: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async ({ page = 1, limit = 20, unreadOnly = false }: { page?: number; limit?: number; unreadOnly?: boolean }, { rejectWithValue }) => {
    try {
      const response = await NotificationService.getNotifications(page, limit, unreadOnly);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao buscar notificações');
    }
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  'notification/fetchUnreadNotifications',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await NotificationService.getUnreadNotifications(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao buscar notificações não lidas');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await NotificationService.markAsRead(notificationId);
      return response.data.notification;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao marcar como lida');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await NotificationService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao marcar todas como lidas');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao deletar notificação');
    }
  }
);

export const fetchNotificationStats = createAsyncThunk(
  'notification/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await NotificationService.getNotificationStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erro ao buscar estatísticas');
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadNotifications.unshift(action.payload);
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      // Marcar na lista principal
      const notificationIndex = state.notifications.findIndex(n => n._id === action.payload);
      if (notificationIndex !== -1) {
        state.notifications[notificationIndex].isRead = true;
        state.notifications[notificationIndex].readAt = new Date().toISOString();
      }
      
      // Remover da lista de não lidas
      state.unreadNotifications = state.unreadNotifications.filter(n => n._id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
      });
      state.unreadNotifications = [];
      state.lastUpdated = new Date().toISOString();
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
      state.unreadNotifications = state.unreadNotifications.filter(n => n._id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    clearNotificationError: (state) => {
      state.error = null;
    },
    
    resetNotifications: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Unread Notifications
    builder
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unreadNotifications = action.payload;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark As Read
    builder
      .addCase(markAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationIndex = state.notifications.findIndex(n => n._id === action.payload._id);
        if (notificationIndex !== -1) {
          state.notifications[notificationIndex] = action.payload;
        }
        state.unreadNotifications = state.unreadNotifications.filter(n => n._id !== action.payload._id);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Mark All As Read
    builder
      .addCase(markAllAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          }
        });
        state.unreadNotifications = [];
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Notification
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
        state.unreadNotifications = state.unreadNotifications.filter(n => n._id !== action.payload);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Notification Stats
    builder
      .addCase(fetchNotificationStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchNotificationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchNotificationStats.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotificationError,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;