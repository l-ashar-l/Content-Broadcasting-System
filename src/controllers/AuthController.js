import ResponseFormatter from '../utils/ResponseFormatter.js';

export default class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * Register endpoint handler
   * POST /auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      const user = await this.authService.register({
        name,
        email,
        password,
        role,
      });

      res
        .status(201)
        .json(
          ResponseFormatter.success(
            user,
            'User registered successfully',
            201
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login endpoint handler
   * POST /auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            result,
            'Login successful',
            200
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user endpoint handler
   * GET /auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = await this.authService.getUserById(req.user.id);

      res
        .status(200)
        .json(
          ResponseFormatter.success(user, 'User retrieved successfully')
        );
    } catch (error) {
      next(error);
    }
  }
}
