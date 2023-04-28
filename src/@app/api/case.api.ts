import { AccountService } from '../../@app/services/account.service';
import { SfAccountVo, SfCaseVo, URL } from 'cybersafepolicy-core';
import { Request, Response, Router } from 'express';
import { CaseService } from '../../@app/services/case.service';
import { Route } from '../../@shared/interface/route.interface';
import { ResponseUtility } from '../../@shared/utility/response.utility';

class CaseApi implements Route {
    public path = URL.MJR_FAQ;
    public router = Router();

    private caseService = new CaseService;
    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // /api/core/v1/auth/list
        this.router.post(`${this.path}${URL.ADD_UPDATE}`, async (req: Request, res: Response) => {
            try {
                let vo: SfCaseVo = req.body;
                const acc: SfAccountVo = await new AccountService().queryById(vo.AccountId);
                vo.ContactId = acc.npe01__One2OneContact__c;
                vo = await this.caseService.addUpdateCase(vo);
                ResponseUtility.sendSuccess(res, vo);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });
    }
}

export default CaseApi;
