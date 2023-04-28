import { TABLE } from "../const/table.name";
import { DbService } from "../../@shared/service/db.service";
import { SfContactVo } from "cybersafepolicy-core";

export class ContactService extends DbService {

    /* ************************************* Constructor ******************************************** */
    constructor() {
        super(TABLE.CONTACT);
    }

    /* ************************************* Public Methods ******************************************** */
    public addUpdateContact = async (vo: SfContactVo): Promise<SfContactVo> => {
        try {
            return await this.addUpdateRow<SfContactVo>(vo);
        } catch (error) {
            throw error;
        }
    }

    /* ************************************* Private Methods ******************************************** */
}