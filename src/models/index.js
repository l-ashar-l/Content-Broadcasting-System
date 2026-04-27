import User from './User.js';
import Content from './Content.js';
import ContentSlot from './ContentSlot.js';
import ContentSchedule from './ContentSchedule.js';

/**
 * Database Models Configuration
 * Establishes relationships between models following OOP principles
 */

// User relationships
User.hasMany(Content, { foreignKey: 'uploaded_by', as: 'uploadedContent' });
Content.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

User.hasMany(Content, { foreignKey: 'approved_by', as: 'approvedContent' });
Content.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

// Content and Slot relationships
ContentSlot.hasMany(ContentSchedule, { foreignKey: 'slot_id', as: 'schedules' });
ContentSchedule.belongsTo(ContentSlot, { foreignKey: 'slot_id', as: 'slot' });

// Content and Schedule relationships
Content.hasMany(ContentSchedule, { foreignKey: 'content_id', as: 'schedules' });
ContentSchedule.belongsTo(Content, { foreignKey: 'content_id', as: 'content' });

export { User, Content, ContentSlot, ContentSchedule };
