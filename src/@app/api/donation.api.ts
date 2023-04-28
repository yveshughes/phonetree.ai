import { DonationDto, SfOpportunityVo, URL } from 'cybersafepolicy-core';
import { Request, Response, Router } from 'express';
import { DonationService } from '../../@app/services/donation.service';
import { OpportunityService } from '../../@app/services/opportunity.service';
import { Route } from '../../@shared/interface/route.interface';
import { StripeApiService } from '../../@shared/service/stripe-api.service';
import { ResponseUtility } from '../../@shared/utility/response.utility';

class DonationApi implements Route {
    public path = URL.MJR_DONATION;
    public router = Router();

    private donationService = new DonationService();
    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // /api/core/v1/donation/add-update
        this.router.post(`${this.path}${URL.ADD_UPDATE}`, async (req: Request, res: Response) => {
            try {
                let dto: DonationDto = req.body;
                const user = await new OpportunityService().getUser(dto.donation.Opportunity__c) as SfOpportunityVo;
                if (!user.Stripe_Cust_Id__c) {
                    user.Stripe_Cust_Id__c = await new StripeApiService().createCustomer(user.Email__c, user.First_Name__c);
                    await new OpportunityService().updateFieldByKey(user.Id, 'Stripe_Cust_Id__c', user.Stripe_Cust_Id__c);
                }
                const stripe = new StripeApiService();
                const meta = { userId: user.Id, type: "MANUAL" } as any;;
                const result = await stripe.payByPaymentMethod(dto.payment.pmId, dto.donation.Amount__c * 100, user.Email__c, user.Stripe_Cust_Id__c, meta);
                if (result.status === 'succeeded') {
                    dto.donation = await this.donationService.addUpdateDonation(dto.donation);
                    ResponseUtility.sendSuccess(res, dto.donation, "Payment Successful!! Thanks for your donation.");
                    return;
                }
                ResponseUtility.sendFailResponse(res, "Payment Failed");
            } catch (error) {
                console.log('xx xx x ', error);
                ResponseUtility.sendFailResponse(res, error);
            }
        });
    }
}

export default DonationApi;
