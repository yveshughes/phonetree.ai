import { ResponseUtility } from '../../@shared/utility/response.utility';
import { Router, Request, Response } from 'express';
import { Route } from '../../@shared/interface/route.interface';
import { URL } from 'cybersafepolicy-core';
import { PromoCodeService } from '../../@app/services/promo-code.service';

class PromoCodeApi implements Route {
  public path = URL.MJR_PROMO_CODE;
  public router = Router();

  private pcService = new PromoCodeService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // /api/core/v1/agency/list
    this.router.get(`${this.path}${URL.DETAIL}`, async (req: Request, res: Response) => {
      try {
        if (!req.query.name) {
          ResponseUtility.sendFailResponse(res, null, 'Name is required');
          return;
        }
        const pc = await this.pcService.getPromoCodeByName(req.query.name as string);
        ResponseUtility.sendSuccess(res, pc);
      } catch (error) {
        ResponseUtility.sendFailResponse(res, error);
      }
    });
  }
}

export default PromoCodeApi;
