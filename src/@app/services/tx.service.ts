import { TABLE } from "../const/table.name";
import { DbService } from "../../@shared/service/db.service";
import { PAYMENT, SfTxVo } from "cybersafepolicy-core";
import Stripe from "stripe";
import { v4 as uuidv4 } from 'uuid';

export class TxService extends DbService {

    /* ************************************* Constructor ******************************************** */
    constructor() {
        super(TABLE.TX);
    }

    /* ************************************* Public Methods ******************************************** */
    public addUpdateTx = async (tx: SfTxVo): Promise<SfTxVo> => {
        try {
            return await this.addUpdateRow<SfTxVo>(tx);
        } catch (error) {
            throw error;
        }
    }

    public addTxn = async (res: Stripe.Response<Stripe.PaymentIntent>, userId: string, amount: number): Promise<void> => {
        const tx = {} as SfTxVo;
        tx.Name = uuidv4();
        tx.Amount__c = res.amount_received;
        tx.Date__c = new Date();
        tx.Gateway_Res__c = JSON.stringify(res);
        tx.Opportunity__c = userId;
        tx.Status__c = res.amount_received === amount && res.status === 'succeeded' ? PAYMENT.PAID : PAYMENT.UNPAID;
        tx.Pi_Id__c = res.id;
        if (res.charges.data?.length > 0) {
            const pm = res.charges.data[0].payment_method_details;
            tx.Type__c = pm?.type ?? '';
            tx.Card_Type__c = pm?.card?.brand ?? '';
            tx.Last_4__c = pm?.card?.last4 ?? '';
            tx.Tx_Id__c = res.charges.data[0].id;
        }
        await this.addUpdateTx(tx);
    }

    /* ************************************* Private Methods ******************************************** */
}