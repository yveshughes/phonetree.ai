import { StringUtility, URL, UserAccessDto, UserAuthDto } from 'cybersafepolicy-core';
import { Request, Response, Router } from 'express';
import { AuthService } from '../../@app/services/auth.service';
import { OpportunityService } from '../../@app/services/opportunity.service';
import { PasswordResetService } from '../../@app/services/password-reset.service';
import { Route } from '../../@shared/interface/route.interface';
import { ResponseUtility } from '../../@shared/utility/response.utility';

class AuthApi implements Route {
  public path = URL.MJR_AUTH;
  public router = Router();

  private authService = new AuthService();
  private passwordResetService = new PasswordResetService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // /api/core/v1/auth/list
    this.router.post(`${this.path}${URL.LOGIN}`, async (req: Request, res: Response) => {
      try {
        const dto: UserAuthDto = req.body;
        if (!(dto && dto.email && dto.password)) {
          ResponseUtility.sendSuccess(res, null, 'Email and password is required');
          return;
        }
        const tokenDto: UserAccessDto | null = await this.authService.authenticate(StringUtility.sanatize(dto.email), dto.password);
        if (!tokenDto || !tokenDto.token) {
          ResponseUtility.sendSuccess(res, tokenDto, 'Invalid email or password');
          return;
        }
        ResponseUtility.sendSuccess(res, tokenDto);
      } catch (error) {
        ResponseUtility.sendFailResponse(res, error);
      }
    });
    // /api/core/v1/auth/reset-link
    this.router.post(`${this.path}${URL.RESET_LINK}`, async (req: Request, res: Response) => {
      try {
        const email: string = req.body?.email;
        if (!email) {
          ResponseUtility.sendSuccess(res, null, 'Email is required');
          return;
        }
        const link = await this.passwordResetService.getResetPassword(email);
        if (link && link.Id) {
          await this.passwordResetService.deleteResetPassword(link.Id);
        }
        const user = await new OpportunityService().getUserByEmail(email);
        if (user && user.Id) {
          this.passwordResetService.savePasswordResetVo(user);
        }
        ResponseUtility.sendSuccess(res, null);
      } catch (error) {
        ResponseUtility.sendFailResponse(res, error);
      }
    });

    this.router.get(`${this.path}${URL.RESET_LINK}`, async (req: Request, res: Response) => {
      try {
        if (!req.query || !req.query.userId) {
          ResponseUtility.sendFailResponse(res, 'Required userId');
          return;
        }
        const ret = await this.passwordResetService.getResetPasswordByUserId(req.query.userId as string);
        ResponseUtility.sendSuccess(res, ret);
      } catch (error) {
        ResponseUtility.sendFailResponse(res, error);
      }
    });
  }
}

export default AuthApi;
