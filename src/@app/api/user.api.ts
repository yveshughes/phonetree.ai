import { SfOpportunityVo, StringUtility, URL, UserPaymentDto, UserStatus } from 'cybersafepolicy-core';
import { Request, Response, Router } from 'express';
import { OpportunityService } from '../../@app/services/opportunity.service';
import { Route } from '../../@shared/interface/route.interface';
import { ResponseUtility } from '../../@shared/utility/response.utility';

class UserApi implements Route {
  public path = URL.MJR_USER;
  public router = Router();

  private opportunityService = new OpportunityService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /* 
    * @api {post} /api/core/v1/user/add-update Add/Update User
    */
    this.router.post(`${this.path}${URL.ADD_UPDATE}`, async (req: Request, res: Response) => {
      try {
        req.body.Email__c = StringUtility.sanatize(req.body.Email__c);
        const opportunitybyEmail = await this.opportunityService.queryByField('Email__c', req.body.Email__c);
        if (opportunitybyEmail?.length > 0) {
          ResponseUtility.sendSuccess(res, null, "Email Already Exist");
          return;
        }
        req.body.Status__c = UserStatus.PENDING;
        const opportunity = await this.opportunityService.addUpdateOpportunity(req.body as SfOpportunityVo);
        ResponseUtility.sendSuccess(res, opportunity);
      } catch (error) {
        ResponseUtility.sendFailResponse(res, error);
      }
    });

    /*
    * @api {get} /api/core/v1/user/update-package Update Package 
    */
    this.router.get(`${this.path}${URL.UPDATE_PACK}`, async (req: Request, res: Response) => {
      try {
        if (!req.query || !req.query.userId || !req.query.packType) {
          ResponseUtility.sendFailResponse(res, 'Required userId and pack type.');
          return;
        }
        const ret = await this.opportunityService.updateUserPackage(req.query.userId as string, req.query.packType as string);
        ResponseUtility.sendSuccess(res, ret);
      } catch (error) {
        ResponseUtility.sendFailResponse(res, error);
      }
    });

    /*
    * @api {post} /api/core/v1/user/pay Pay
    */
    this.router.post(`${this.path}${URL.PAY}`, async (req: Request, res: Response) => {
      try {
        const dto = req.body as UserPaymentDto;
        const ret = await this.opportunityService.payAndUpdatePackage(dto);
        ResponseUtility.sendSuccess(res, ret);
      } catch (error) {
        console.log(error);
        ResponseUtility.sendFailResponse(res, error);
      }
    });

    /*
   * @api {get} /api/core/v1/user/status get user status 
   */
    this.router.get(`${this.path}${URL.STATUS}`, async (req: Request, res: Response) => {
      try {
        if (!req.query || !req.query.userId) {
          ResponseUtility.sendFailResponse(res, 'Required userId');
          return;
        }
        const ret = await this.opportunityService.queryById(req.query.userId as string);
        ResponseUtility.sendSuccess(res, ret.Status__c);
      } catch (error) {
        ResponseUtility.sendFailResponse(res, error);
      }
    });

    this.router.get(`${this.path}/update-password`, async (req: Request, res: Response) => {
      try {
        if (!req.query || !req.query.userId || !req.query.password) {
          ResponseUtility.sendFailResponse(res, 'Required userId and password');
          return;
        }
        const ret = await this.opportunityService.updatePassword(req.query.userId as string, req.query.password as string);
        await this.opportunityService.updateFieldByKey(req.query.userId as string, 'Reset_Password__c', false);
        ResponseUtility.sendSuccess(res, ret, 'Password updated successfully');
      } catch (error) {
        console.log(error);
        ResponseUtility.sendFailResponse(res, error);
      }
    });

    this.router.get(`${this.path}/activate`, async (req: Request, res: Response) => {
      try {
        if (!req.query || !req.query.userId) {
          ResponseUtility.sendFailResponse(res, 'Required userId');
          return;
        }
        const ret = await this.opportunityService.activateUserAndLogin(req.query.userId as string);
        ResponseUtility.sendSuccess(res, ret);
      } catch (error) {
        console.log(error);
        ResponseUtility.sendFailResponse(res, error);
      }
    });

    this.router.get(`${this.path}/is-reset-password`, async (req: Request, res: Response) => {
      try {
        if (!req.query || !req.query.email) {
          ResponseUtility.sendFailResponse(res, 'Required email');
          return;
        }
        const ret = await this.opportunityService.queryByField('Email__c', req.query.email as string);
        console.log(ret);
        let userId = null;
        if (ret && ret?.length > 0 && ret[0].Reset_Password__c) {
          userId = ret[0].Id;
        }
        ResponseUtility.sendSuccess(res, userId);
      } catch (error) {
        console.log(error);
        ResponseUtility.sendFailResponse(res, error);
      }
    });
  }
}

export default UserApi;
