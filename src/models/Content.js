import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Content Model - Represents educational content
 * Follows SRP: Only defines content schema
 * Stores all content metadata and status information
 */
const Content = sequelize.define(
  'Content',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('uploaded', 'pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rotation_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      comment: 'Duration in minutes for content rotation',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'contents',
    timestamps: false,
  }
);

export default Content;
