import { TABLE } from "../const/table.name";
import { DbService } from "../../@shared/service/db.service";
import { SfInvoiceVo } from "cybersafepolicy-core";

export class InvoiceService extends DbService {

    /* ************************************* Constructor ******************************************** */
    constructor() {
        super(TABLE.INVOICE);
    }

    /* ************************************* Public Methods ******************************************** */
    public addUpdateInvoice = async (invoice: SfInvoiceVo): Promise<SfInvoiceVo> => {
        try {
            return await this.addUpdateRow<SfInvoiceVo>(invoice);
        } catch (error) {
            throw error;
        }
    }

    /* ************************************* Private Methods ******************************************** */
}