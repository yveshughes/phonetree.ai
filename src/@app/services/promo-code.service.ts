import { TABLE } from "../const/table.name";
import { DbService } from "../../@shared/service/db.service";
import { SfPromoCodeVo } from "cybersafepolicy-core";

export class PromoCodeService extends DbService {

    /* ************************************* Constructor ******************************************** */
    constructor() {
        super(TABLE.PROMO_CODE);
    }

    /* ************************************* Public Methods ******************************************** */
    public addUpdatePromoCode = async (pc: SfPromoCodeVo): Promise<SfPromoCodeVo> => {
        try {
            return await this.addUpdateRow<SfPromoCodeVo>(pc);
        } catch (error) {
            throw error;
        }
    }

    public getPromoCodeByName = async (name: string): Promise<SfPromoCodeVo> => {
        try {
            return await this.queryByField('Name', name);
        } catch (error) {
            throw error;
        }
    }

    public getPromoCode = async (Id: string): Promise<SfPromoCodeVo> => {
        try {
            return await this.queryById(Id);
        } catch (error) {
            throw error;
        }
    }

    /* ************************************* Private Methods ******************************************** */
}