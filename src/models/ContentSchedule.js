import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ContentSchedule = sequelize.define(
  'ContentSchedule',
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
    slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'content_slots',
        key: 'id',
      },
    },
    rotation_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order in rotation cycle',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      comment: 'Duration in minutes for this content in rotation',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'content_schedules',
    timestamps: false,
  }
);

export default ContentSchedule;
