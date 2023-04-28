import { TABLE } from "../const/table.name";
import { DbService } from "../../@shared/service/db.service";
import { FREQUENCY, RECORD_TYPE, SfAccountVo, SfContactVo, SfInvoiceVo, SfOpportunityVo, SfPromoCodeVo, STAGE, UserPaymentDto, UserStatus } from "cybersafepolicy-core";
import { StripeApiService } from "../../@shared/service/stripe-api.service";
import { v4 as uuidv4 } from 'uuid';
import { TxService } from "./tx.service";
import bcrypt from 'bcrypt';
import { InvoiceService } from "./invoice.service";
import { TierUtility } from "../../@app/utility/tier-utility";
import { MomentService } from "../../@shared/service/moment.service";
import { RecordResult } from "jsforce";
import { PromoCodeService } from "./promo-code.service";
import { AuthService } from "./auth.service";
import { AccountService } from "./account.service";
import { ContactService } from "./contact.service";

export class OpportunityService extends DbService {

    /* ************************************* Constructor ******************************************** */
    constructor() {
        super(TABLE.OPPORTUNITY);
    }

    /* ************************************* Public Methods ******************************************** */
    public addUpdateOpportunity = async (opportunity: SfOpportunityVo | any): Promise<SfOpportunityVo> => {
        try {
            opportunity.CloseDate = new Date();
            // Encrypt password
            opportunity.Password__c = await bcrypt.hash(opportunity.Password__c, 3);
            opportunity.Stripe_Cust_Id__c = await new StripeApiService().createCustomer(opportunity.Email__c, opportunity.First_Name__c);
            const accountVo: SfAccountVo = this._getAccountVo(opportunity);
            const account = await new AccountService().addUpdateAccount(accountVo);
            opportunity.AccountId = account.Id;
            const contact: SfContactVo = this._getContactvo(opportunity, account);
            const c = await new ContactService().addUpdateContact(contact);
            delete opportunity.accType;
            await new AccountService().updateFieldByKey(account.Id, 'npe01__One2OneContact__c', c.Id);
            return await this.addUpdateRow<SfOpportunityVo>(opportunity);
        } catch (error) {
            throw error;
        }
    }

    public updatePassword = async (opportunityId: string, password: string): Promise<boolean> => {
        const pass = await bcrypt.hash(password, 3);
        return await this.updateFieldByKey(opportunityId, 'Password__c', pass);
    };

    public updateUserPackage = async (Id: string, packType: string): Promise<boolean> => {
        try {
            const db = await this.getConnection();
            const ret = await db.sobject(this.table).update({
                Id, Subscription_Type__c: packType
            }) as RecordResult;
            return ret.success;
        } catch (error) {
            console.log('errr', error);
            throw error;
        }
    }

    public payAndUpdatePackage = async (dto: UserPaymentDto): Promise<string | null> => {
        try {
            const user = await this.queryById(dto.userId) as SfOpportunityVo;
            user.Promo_Code__c = dto.pcId;
            await this.updateFieldByKey(dto.userId, 'Promo_Code__c', dto.pcId);
            const amount = await this._getPackageFixedAmount(user.Subscription_Type__c, dto.pcId);
            const stripe = new StripeApiService();
            await this._addCustPaymentMethod(user.Stripe_Cust_Id__c, dto.pmId, user.Subscription_Type__c);
            const meta = { userId: user.Id, type: "MANUAL" } as any;;
            const res = await stripe.payByPaymentMethod(dto.pmId, amount, user.Email__c, user.Stripe_Cust_Id__c, meta);
            await new TxService().addTxn(res, dto.userId, amount);
            if (res.status === 'succeeded') {
                await this._updateUserStatusAndStage(UserStatus.ACTIVE, STAGE.WON, dto.userId);
                await this._addRecurringInvoice(user.Subscription_Type__c, user.Id);
            }
            const userUpdated = await this.queryById(dto.userId) as SfOpportunityVo;
            if (res.amount_received === amount) {
                return new AuthService().getAccessToken(userUpdated);
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }

    public getUser = async (Id: string): Promise<SfOpportunityVo> => {
        return await this.queryById(Id);
    }

    public getUserByEmail = async (email: string): Promise<SfOpportunityVo | null> => {
        const list: Array<SfOpportunityVo> = await this.queryByField('Email__c', email);
        if (list?.length > 0) {
            return list[0];
        }
        return null;
    }

    public activateUserAndLogin = async (userId: string): Promise<string | null> => {
        await this._updateUserStatusAndStage(UserStatus.ACTIVE, STAGE.WON, userId);
        const userUpdated = await this.queryById(userId) as SfOpportunityVo;
        return new AuthService().getAccessToken(userUpdated);
    }

    /* ************************************* Private Methods ******************************************** */
    private _getPackageFixedAmount = async (packageType: string, promoCodeId: string | null): Promise<number> => {
        const pack = TierUtility.getTier(packageType);
        let price = pack.price;
        if (promoCodeId) {
            const pc: SfPromoCodeVo = await new PromoCodeService().getPromoCode(promoCodeId);
            let discount = pc.Value__c * 100;
            if (!pc.is_flat__c) {
                discount = price * pc.Value__c / 100;
            }
            price = price - discount;
        }
        return price;
    };

    private _addCustPaymentMethod = async (custId: string, pmId: string, packageType: string): Promise<void> => {
        try {
            if (packageType === TierUtility.t1) {
                return;
            }
            await new StripeApiService().attachPaymentMethodToCustomer(custId, pmId);
        } catch (error) {
            throw error;
        }
    }

    private _addRecurringInvoice = async (packageType: string, userId: string): Promise<void> => {
        const pack = TierUtility.getTier(packageType);
        const invoice = {} as SfInvoiceVo;
        invoice.Name = uuidv4();
        invoice.Opportunity__c = userId;
        invoice.Date__c = new Date();
        invoice.Start_Date__c = new Date();
        invoice.Amount__c = pack.frequencyPrice;
        invoice.Frequency__c = pack.frequency;
        invoice.Subscription_Type__c = packageType;
        const billDate = this._getNextBillDate(invoice.Start_Date__c, pack.frequency);
        if (billDate) {
            invoice.Bill_Date__c = billDate;
        }
        await new InvoiceService().addUpdateInvoice(invoice);
    };

    private _updateUserStatusAndStage = async (status: string, stage: string, userId: string) => {
        try {
            return await this.updateTwoFieldByKey(userId, 'Status__c', status, 'StageName', stage);
        } catch (error) {
            throw error;
        }
    };

    private _getNextBillDate = (date: Date, frequency: string) => {
        try {
            switch (frequency) {
                case FREQUENCY.MONTHLY:
                    return MomentService.addMonthToDate(date, 1);
                    break;
                case FREQUENCY.YEARLY:
                    return MomentService.addYearToDate(date, 1);
                    break;
                default:
                    return null;
                    break;
            }
        } catch (error) {
            throw error;
        }
    };

    private _getAccountVo = (opportunity: SfOpportunityVo | any): SfAccountVo => {
        const vo = {} as SfAccountVo;
        vo.Name = opportunity.Company__c ?? "";
        vo.RecordTypeId = RECORD_TYPE.ORG;
        vo.Type = 'Nonprofit';
        return vo;
    }

    private _getContactvo = (opportunity: SfOpportunityVo, account: SfAccountVo): SfContactVo => {
        const vo = {} as SfContactVo | any;
        // vo.Name = opportunity.Name ?? "";
        vo.AccountId = account.Id;
        vo.Email = opportunity.Email__c;
        vo.LastName = opportunity.Last_Name__c;
        vo.FirstName= opportunity.First_Name__c;
        return vo;
    }
}