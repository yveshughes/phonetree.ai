import { TABLE } from "../const/table.name";
import { DbService } from "../../@shared/service/db.service";
import { SfDonationVo } from "cybersafepolicy-core";
import { v4 as uuidv4 } from 'uuid';

export class DonationService extends DbService {

    /* ************************************* Constructor ******************************************** */
    constructor() {
        super(TABLE.DONATION);
    }

    /* ************************************* Public Methods ******************************************** */
    public addUpdateDonation = async (vo: SfDonationVo): Promise<SfDonationVo> => {
        try {
            vo.Name = vo.Name ?? uuidv4();
            return await this.addUpdateRow<SfDonationVo>(vo);
        } catch (error) {
            throw error;
        }
    }

    /* ************************************* Private Methods ******************************************** */
}