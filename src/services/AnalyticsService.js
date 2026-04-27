import { Op } from 'sequelize';
import { ContentUsage, Content } from '../models/index.js';
import sequelize from '../config/database.js';

export default class AnalyticsService {
  /**
   * Record content usage event
   * @param {number} contentId - Content ID
   * @param {string} action - Action type: 'view', 'download', 'share'
   * @param {object} options - Additional data { userId, ip }
   */
  async recordUsage(contentId, action = 'view', options = {}) {
    try {
      // Validate that content exists
      const content = await Content.findByPk(contentId);
      if (!content) {
        throw new Error(`Content with ID ${contentId} not found`);
      }

      const usage = await ContentUsage.create({
        content_id: contentId,
        action,
        user_id: options.userId || null,
        ip_address: options.ip || null,
      });

      return usage;
    } catch (error) {
      console.error('Error recording usage:', error);
      throw error;
    }
  }

  /**
   * Get most active subjects by usage count
   * @param {number} limit - Number of top subjects to return
   */
  async getMostActiveSubjects(limit = 5) {
    try {
      const results = await sequelize.query(
        `
        SELECT 
          c."subject",
          COUNT(cu.id) as usage_count,
          COUNT(DISTINCT CASE WHEN cu."action" = 'view' THEN cu.id END) as views,
          COUNT(DISTINCT CASE WHEN cu."action" = 'download' THEN cu.id END) as downloads,
          COUNT(DISTINCT CASE WHEN cu."action" = 'share' THEN cu.id END) as shares
        FROM "contents" c
        LEFT JOIN "content_usages" cu ON c.id = cu.content_id
        GROUP BY c."subject"
        ORDER BY usage_count DESC
        LIMIT :limit
        `,
        {
          replacements: { limit },
          type: 'SELECT',
        }
      );

      return results;
    } catch (error) {
      console.error('Error getting most active subjects:', error);
      throw error;
    }
  }

  /**
   * Get content usage statistics
   * @param {number} contentId - Content ID
   */
  async getContentUsage(contentId) {
    try {
      const content = await Content.findByPk(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      const stats = await sequelize.query(
        `
        SELECT 
          COUNT(id) as total_usage,
          COUNT(DISTINCT CASE WHEN "action" = 'view' THEN id END) as total_views,
          COUNT(DISTINCT CASE WHEN "action" = 'download' THEN id END) as total_downloads,
          COUNT(DISTINCT CASE WHEN "action" = 'share' THEN id END) as total_shares,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT ip_address) as unique_ips
        FROM "content_usages"
        WHERE content_id = :contentId
        `,
        {
          replacements: { contentId },
          type: 'SELECT',
        }
      );

      const recentUsage = await ContentUsage.findAll({
        where: { content_id: contentId },
        order: [['created_at', 'DESC']],
        limit: 10,
        include: [
          {
            association: 'user',
            attributes: ['id', 'email', 'name'],
          },
        ],
      });

      return {
        content: {
          id: content.id,
          title: content.title,
          subject: content.subject,
        },
        statistics: stats[0] || {
          total_usage: 0,
          total_views: 0,
          total_downloads: 0,
          total_shares: 0,
          unique_users: 0,
          unique_ips: 0,
        },
        recent_usage: recentUsage,
      };
    } catch (error) {
      console.error('Error getting content usage:', error);
      throw error;
    }
  }

  /**
   * Get subject-wise analytics summary
   */
  async getSubjectAnalytics() {
    try {
      const results = await sequelize.query(
        `
        SELECT 
          c."subject",
          COUNT(DISTINCT c.id) as total_content,
          COUNT(cu.id) as total_usage,
          COUNT(DISTINCT CASE WHEN cu."action" = 'view' THEN cu.id END) as total_views,
          COUNT(DISTINCT CASE WHEN cu."action" = 'download' THEN cu.id END) as total_downloads,
          COUNT(DISTINCT cu.user_id) as active_users,
          MAX(cu.created_at) as last_access
        FROM "contents" c
        LEFT JOIN "content_usages" cu ON c.id = cu.content_id
        GROUP BY c."subject"
        ORDER BY total_usage DESC
        `,
        {
          type: 'SELECT',
        }
      );

      return results;
    } catch (error) {
      console.error('Error getting subject analytics:', error);
      throw error;
    }
  }

  /**
   * Get daily usage trend for a content or subject
   * @param {number} contentId - Optional content ID
   * @param {string} subject - Optional subject name
   * @param {number} days - Number of days to look back
   */
  async getUsageTrend(contentId = null, subject = null, days = 7) {
    try {
      let whereClause = '';
      const replacements = { days };

      if (contentId) {
        whereClause = 'WHERE cu.content_id = :contentId';
        replacements.contentId = contentId;
      } else if (subject) {
        whereClause = 'WHERE c."subject" = :subject';
        replacements.subject = subject;
      }

      const results = await sequelize.query(
        `
        SELECT 
          DATE(cu.created_at) as date,
          COUNT(id) as usage_count,
          COUNT(DISTINCT CASE WHEN "action" = 'view' THEN id END) as views,
          COUNT(DISTINCT CASE WHEN "action" = 'download' THEN id END) as downloads,
          COUNT(DISTINCT user_id) as unique_users
        FROM "content_usages" cu
        LEFT JOIN "contents" c ON cu.content_id = c.id
        ${whereClause}
        AND cu.created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(cu.created_at)
        ORDER BY date DESC
        `,
        {
          replacements,
          type: 'SELECT',
        }
      );

      return results;
    } catch (error) {
      console.error('Error getting usage trend:', error);
      throw error;
    }
  }
}
