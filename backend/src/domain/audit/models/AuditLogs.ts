import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';

export type AuditEventType =
  | 'USER_REGISTERED'
  | 'USER_LOGIN'
  | 'PRODUCT_VIEWED'
  | 'PRODUCT_SEARCHED'
  | 'CHECKOUT_STARTED'
  | 'PAYMENT_STARTED'
  | 'PAYMENT_APPROVED'
  | 'ADDRESS_CREATED'
  | 'ACCOUNT_UPDATED';

export interface AuditLogAttributes {
  id: number;
  user_id: number | null;
  event_type: AuditEventType;
  entity_type: string | null;
  entity_id: number | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  created_at: Date;
}

interface AuditLogCreationAttributes
  extends Optional<AuditLogAttributes, 'id' | 'user_id' | 'entity_type' | 'entity_id' | 'metadata' | 'ip' | 'created_at'> {}

export class AuditLogs
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  declare id: number;
  declare user_id: number | null;
  declare event_type: AuditEventType;
  declare entity_type: string | null;
  declare entity_id: number | null;
  declare metadata: Record<string, unknown> | null;
  declare ip: string | null;
  declare created_at: Date;
}

AuditLogs.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    event_type: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'AuditLogs',
    tableName: 'AuditLogs',
    timestamps: false,
  },
);
