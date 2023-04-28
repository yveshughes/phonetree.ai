import { TABLE } from "../const/table.name";
import { DbService } from "../../@shared/service/db.service";
import * as cron from 'node-cron'
import { FREQUENCY, SfInvoiceVo, SfOpportunityVo } from "cybersafepolicy-core";
import { MomentService } from "../../@shared/service/moment.service";
import { StripeApiService } from "../../@shared/service/stripe-api.service";
import { OpportunityService } from "./opportunity.service";
import { TxService } from "./tx.service";

export class PaymentTaskService extends DbService {

    /* ************************************* Constructor ******************************************** */
    constructor() {
        super(TABLE.INVOICE);
    }

    /* ************************************* Public Methods ******************************************** */
    public runTask = async (): Promise<void> => {
        try {
            // Cron Runs every day at 5 AM
            cron.schedule('* 00 05 * * *', async () => {
                await this._payAndUpdateInvoice();
            });
        } catch (error) {
            throw error;
        }
    }

    /* ************************************* Private Methods ******************************************** */
    private _payAndUpdateInvoice = async (): Promise<void> => {
        try {
            const columns = ["Id", "Name", "Amount__c", "Date__c", "End_Date__c", "Frequency__c", "Opportunity__c",
                "Start_Date__c", "Subscription_Type__c", "Bill_Date__c"];
            const invoice: Array<SfInvoiceVo> = await this.queryByFieldSoql('Bill_Date__c', 'TODAY', columns);
            const invoiceList = [] as Array<SfInvoiceVo>;
            if (invoice?.length > 0) {
                for (let i = 0; i < invoice.length; i++) {
                    if (!MomentService.isTodaysDate(invoice[i].End_Date__c) &&
                        invoice[i].Frequency__c &&
                        invoice[i].Frequency__c !== FREQUENCY.ONE_TIME &&
                        invoice[i].Amount__c > 0) {
                        const paid = await this._payInvoice(invoice[i].Opportunity__c, invoice[i].Amount__c, invoice[i].Id);
                        invoiceList.push(this._getInvoiceVo(invoice[i], paid));
                    }
                }
            }
            this._updateInvoiceList(invoiceList);
        } catch (error) {
            console.log('xxx xxx xx xxx error ', error);
            throw error;
        }
    };

    private _payInvoice = async (userId: string, amount: number, invoiceId: string): Promise<boolean> => {
        try {
            const stripe = new StripeApiService();
            const user: SfOpportunityVo = await new OpportunityService().getUser(userId);
            const pm = await stripe.listPaymentMethod(user.Stripe_Cust_Id__c);
            const meta = { userId: user.Id, type: "AUTO", invoiceId} as any;;
            const res = await stripe.payByPaymentMethod(pm, amount, user.Email__c, user.Stripe_Cust_Id__c, meta);
            await new TxService().addTxn(res, userId, amount);
            return res.status === 'succeeded';
        } catch (error) {
            throw error;
        }
    };

    private _updateInvoiceList = async (invoiceList: Array<SfInvoiceVo>): Promise<void> => {
        if (!invoiceList || invoiceList.length <= 0) {
            return;
        }
        this.batchUpdate(invoiceList);
    };

    private _getInvoiceVo = (invoice: SfInvoiceVo, paid: boolean): SfInvoiceVo => {
        let updatedInvoice = invoice;
        const nextBillDate = this._getInvoiceBillDate(updatedInvoice.Frequency__c, updatedInvoice.Bill_Date__c);
        if (nextBillDate && paid) {
            updatedInvoice.Bill_Date__c = nextBillDate;
        } else {
            updatedInvoice.Bill_Date__c = MomentService.addDaysToDate(updatedInvoice.Bill_Date__c, 1);
        }
        return updatedInvoice;
    }

    private _getInvoiceBillDate = (frequency: string, date: Date): Date | null => {
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
    }
}