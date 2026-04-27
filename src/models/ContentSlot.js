import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ContentSlot = sequelize.define(
  'ContentSlot',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'content_slots',
    timestamps: false,
  }
);

export default ContentSlot;
