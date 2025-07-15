/**
 * Modelo de Notificação - MongoDB com Mongoose
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'feeding' | 'health' | 'news' | 'system' | 'reminder' | 'alert' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isDelivered: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  data?: {
    petId?: mongoose.Types.ObjectId;
    actionUrl?: string;
    imageUrl?: string;
    expiresAt?: Date;
    metadata?: Record<string, any>;
  };
  scheduledFor?: Date;
  channels: ('push' | 'email' | 'sms' | 'in_app')[];
  deliveryStatus: {
    push?: 'pending' | 'sent' | 'delivered' | 'failed';
    email?: 'pending' | 'sent' | 'delivered' | 'failed';
    sms?: 'pending' | 'sent' | 'delivered' | 'failed';
    in_app?: 'pending' | 'sent' | 'delivered' | 'failed';
  };
  retryCount: number;
  maxRetries: number;
  tags?: string[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID do usuário é obrigatório'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: [100, 'Título não pode ter mais de 100 caracteres'],
    },
    message: {
      type: String,
      required: [true, 'Mensagem é obrigatória'],
      trim: true,
      maxlength: [500, 'Mensagem não pode ter mais de 500 caracteres'],
    },
    type: {
      type: String,
      required: [true, 'Tipo é obrigatório'],
      enum: {
        values: ['feeding', 'health', 'news', 'system', 'reminder', 'alert', 'promotion'],
        message: 'Tipo deve ser: feeding, health, news, system, reminder, alert ou promotion',
      },
      index: true,
    },
    priority: {
      type: String,
      required: [true, 'Prioridade é obrigatória'],
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Prioridade deve ser: low, medium, high ou urgent',
      },
      default: 'medium',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
      index: true,
    },
    deliveredAt: {
      type: Date,
      index: true,
    },
    readAt: {
      type: Date,
      index: true,
    },
    data: {
      petId: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        sparse: true,
      },
      actionUrl: {
        type: String,
        validate: {
          validator: function (url: string) {
            return !url || /^https?:\/\/.+/.test(url);
          },
          message: 'URL de ação deve ser válida',
        },
      },
      imageUrl: {
        type: String,
        validate: {
          validator: function (url: string) {
            return !url || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
          },
          message: 'URL da imagem deve ser válida',
        },
      },
      expiresAt: {
        type: Date,
        index: true,
      },
      metadata: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    scheduledFor: {
      type: Date,
      index: true,
    },
    channels: [{
      type: String,
      enum: {
        values: ['push', 'email', 'sms', 'in_app'],
        message: 'Canal deve ser: push, email, sms ou in_app',
      },
    }],
    deliveryStatus: {
      push: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending',
      },
      email: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending',
      },
      sms: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending',
      },
      in_app: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending',
      },
    },
    retryCount: {
      type: Number,
      default: 0,
      min: [0, 'Contador de tentativas não pode ser negativo'],
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: [0, 'Máximo de tentativas não pode ser negativo'],
      max: [10, 'Máximo de tentativas deve ser menor que 10'],
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag não pode ter mais de 50 caracteres'],
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Índices compostos
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, isDelivered: 1 });
notificationSchema.index({ 'data.expiresAt': 1 });
notificationSchema.index({ priority: 1, isDelivered: 1 });

// TTL index para notificações expiradas
notificationSchema.index(
  { 'data.expiresAt': 1 },
  { expireAfterSeconds: 0 }
);

// Middleware para marcar como entregue quando lida
notificationSchema.pre('save', function (next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
    if (!this.isDelivered) {
      this.isDelivered = true;
      this.deliveredAt = new Date();
    }
  }
  next();
});

// Middleware para validar canais
notificationSchema.pre('save', function (next) {
  if (this.channels.length === 0) {
    this.channels = ['in_app']; // Canal padrão
  }
  next();
});

// Método estático para buscar notificações não lidas
notificationSchema.statics.findUnreadByUser = function (userId: string) {
  return this.find({ userId, isRead: false })
    .sort({ priority: -1, createdAt: -1 })
    .populate('data.petId', 'name avatar')
    .populate('createdBy', 'name');
};

// Método estático para buscar notificações por tipo
notificationSchema.statics.findByType = function (
  userId: string,
  type: string,
  limit = 50
) {
  return this.find({ userId, type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('data.petId', 'name avatar')
    .populate('createdBy', 'name');
};

// Método estático para buscar notificações agendadas
notificationSchema.statics.findScheduled = function (beforeDate?: Date) {
  const query: any = {
    scheduledFor: { $lte: beforeDate || new Date() },
    isDelivered: false,
  };
  
  return this.find(query)
    .sort({ priority: -1, scheduledFor: 1 })
    .populate('userId', 'name email phone fcmToken')
    .populate('data.petId', 'name avatar');
};

// Método estático para buscar notificações para retry
notificationSchema.statics.findForRetry = function () {
  return this.find({
    isDelivered: false,
    retryCount: { $lt: 3 },
    scheduledFor: { $lte: new Date() },
  })
    .sort({ priority: -1, createdAt: 1 })
    .populate('userId', 'name email phone fcmToken');
};

// Método para marcar como lida
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  if (!this.isDelivered) {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }
  return this.save();
};

// Método para marcar como entregue
notificationSchema.methods.markAsDelivered = function (channel?: string) {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  
  if (channel && this.deliveryStatus[channel]) {
    this.deliveryStatus[channel] = 'delivered';
  }
  
  return this.save();
};

// Método para marcar falha na entrega
notificationSchema.methods.markAsFailed = function (channel?: string) {
  this.retryCount += 1;
  
  if (channel && this.deliveryStatus[channel]) {
    this.deliveryStatus[channel] = 'failed';
  }
  
  return this.save();
};

// Método para verificar se deve tentar novamente
notificationSchema.methods.shouldRetry = function (): boolean {
  return this.retryCount < 3 && !this.isDelivered;
};

// Método estático para criar notificação de alimentação
notificationSchema.statics.createFeedingReminder = function (
  userId: string,
  petId: string,
  feedingTime: Date,
  petName: string
) {
  return this.create({
    userId,
    title: 'Hora da Alimentação! 🍽️',
    message: `Está na hora de alimentar ${petName}!`,
    type: 'feeding',
    priority: 'high',
    channels: ['push', 'in_app'],
    scheduledFor: feedingTime,
    data: {
      petId,
      actionUrl: `/pets/${petId}/feeding`,
    },
    tags: ['feeding', 'reminder'],
  });
};

// Método estático para criar notificação de saúde
notificationSchema.statics.createHealthAlert = function (
  userId: string,
  petId: string,
  alertType: string,
  petName: string,
  message: string
) {
  return this.create({
    userId,
    title: `Alerta de Saúde - ${petName} 🏥`,
    message,
    type: 'health',
    priority: 'urgent',
    channels: ['push', 'email', 'in_app'],
    data: {
      petId,
      actionUrl: `/pets/${petId}/health`,
    },
    tags: ['health', 'alert', alertType],
  });
};

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;