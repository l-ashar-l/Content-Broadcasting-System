import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ContentUsage = sequelize.define(
  'ContentUsage',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'contents',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM('view', 'download', 'share'),
      defaultValue: 'view',
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'content_usages',
    timestamps: false,
  }
);

export default ContentUsage;
