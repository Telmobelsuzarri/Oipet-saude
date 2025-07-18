/**
 * NotificationsScreen - Tela de notificações
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

import { GlassContainer } from '../../components/ui/GlassContainer';
import { COLORS } from '../../constants/theme';
import { NotificationService } from '../../services/NotificationService';
import { useAppDispatch, useAppSelector } from '../../store';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'reminder' | 'alert' | 'promotion' | 'health' | 'system';
  category: 'general' | 'health' | 'feeding' | 'activity' | 'vaccination' | 'appointment';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [pushEnabled, setPushEnabled] = useState(true);

  // Permissões de notificação
  const [notificationSettings, setNotificationSettings] = useState({
    health: true,
    feeding: true,
    activity: true,
    vaccination: true,
    appointment: true,
    general: true,
  });

  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
      checkNotificationPermissions();
    }, [filter])
  );

  useEffect(() => {
    // Listener para notificações recebidas
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
      loadNotifications();
    });

    // Listener para resposta a notificações
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Resposta à notificação:', response);
      handleNotificationResponse(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPushEnabled(status === 'granted');
  };

  const loadNotifications = async () => {
    try {
      const response = await NotificationService.getNotifications(
        1, 
        50, 
        filter === 'unread'
      );
      setNotifications(response.data.data.notifications || []);
      
      // Atualizar badge
      const unreadCount = response.data.data.notifications.filter(
        (n: NotificationItem) => !n.isRead
      ).length;
      await NotificationService.setBadgeCount(unreadCount);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      Alert.alert('Erro', 'Falha ao carregar notificações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const { notification } = response;
    const data = notification.request.content.data;

    if (data?.screen) {
      navigation.navigate(data.screen as any, data.params || {});
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await NotificationService.clearBadge();
      Alert.alert('Sucesso', 'Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      Alert.alert('Erro', 'Falha ao marcar notificações como lidas');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      Alert.alert('Erro', 'Falha ao deletar notificação');
    }
  };

  const togglePushNotifications = async () => {
    if (!pushEnabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setPushEnabled(true);
        Alert.alert('Sucesso', 'Notificações push ativadas');
      } else {
        Alert.alert(
          'Permissão Negada',
          'Para receber notificações, habilite nas configurações do dispositivo'
        );
      }
    } else {
      setPushEnabled(false);
      Alert.alert('Notificações Desativadas', 'Você não receberá mais notificações push');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'health': return 'medical';
      case 'reminder': return 'alarm';
      case 'alert': return 'alert-circle';
      case 'promotion': return 'pricetag';
      case 'info': return 'information-circle';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'health': return COLORS.primary.coral;
      case 'reminder': return COLORS.primary.teal;
      case 'alert': return COLORS.semantic.error;
      case 'promotion': return COLORS.semantic.warning;
      case 'info': return COLORS.semantic.info;
      case 'system': return COLORS.text.secondary;
      default: return COLORS.text.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() => {
        if (!item.isRead) markAsRead(item._id);
        // Navigate based on notification data
        if (item.data?.screen) {
          navigation.navigate(item.data.screen, item.data.params || {});
        }
      }}
    >
      <GlassContainer 
        variant="widget" 
        style={[
          styles.cardContent,
          !item.isRead && styles.unreadCard
        ]}
      >
        <View style={styles.notificationHeader}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor(item.type) + '20' }
          ]}>
            <Ionicons 
              name={getNotificationIcon(item.type) as any} 
              size={24} 
              color={getNotificationColor(item.type)} 
            />
          </View>

          <View style={styles.notificationInfo}>
            <Text style={[
              styles.notificationTitle,
              !item.isRead && styles.unreadText
            ]}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>{formatDate(item.createdAt)}</Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              deleteNotification(item._id);
            }}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.notificationMessage}>{item.message}</Text>

        {!item.isRead && (
          <View style={styles.unreadIndicator} />
        )}
      </GlassContainer>
    </TouchableOpacity>
  );

  const renderSettings = () => (
    <GlassContainer variant="widget" style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Configurações de Notificações</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Notificações Push</Text>
          <Text style={styles.settingDescription}>
            Receber alertas mesmo com o app fechado
          </Text>
        </View>
        <Switch
          value={pushEnabled}
          onValueChange={togglePushNotifications}
          trackColor={{ false: COLORS.glass.widget, true: COLORS.primary.coral }}
        />
      </View>

      <View style={styles.settingsDivider} />

      <Text style={styles.settingsSubtitle}>Tipos de Notificação</Text>

      {Object.entries(notificationSettings).map(([key, value]) => (
        <View key={key} style={styles.settingItem}>
          <Text style={styles.settingLabel}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Text>
          <Switch
            value={value}
            onValueChange={(newValue) => 
              setNotificationSettings(prev => ({ ...prev, [key]: newValue }))
            }
            trackColor={{ false: COLORS.glass.widget, true: COLORS.primary.coral }}
          />
        </View>
      ))}
    </GlassContainer>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <GlassContainer variant="widget" style={styles.emptyContent}>
        <Ionicons name="notifications-off" size={64} color={COLORS.text.secondary} />
        <Text style={styles.emptyTitle}>
          {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
        </Text>
        <Text style={styles.emptyMessage}>
          {filter === 'unread' 
            ? 'Todas as suas notificações foram lidas'
            : 'Você receberá notificações sobre seus pets aqui'
          }
        </Text>
      </GlassContainer>
    </View>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificações</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          >
            <Text style={styles.filterText}>
              {filter === 'all' ? 'Todas' : 'Não lidas'}
            </Text>
            {unreadCount > 0 && filter === 'all' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Ionicons name="checkmark-done" size={20} color={COLORS.primary.coral} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.coral}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderSettings()}

        <Text style={styles.sectionTitle}>
          {filter === 'unread' ? 'Não Lidas' : 'Recentes'}
        </Text>

        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          !loading && renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.widget,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: COLORS.primary.coral,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.background.primary,
    fontWeight: '600',
  },
  markAllButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.glass.widget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  settingsContainer: {
    padding: 20,
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  settingsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: COLORS.border.primary,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  notificationCard: {
    marginBottom: 12,
  },
  cardContent: {
    padding: 16,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary.coral,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  deleteButton: {
    padding: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginLeft: 52,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary.coral,
  },
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});