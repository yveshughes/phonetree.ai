import { TABLE } from "../const/table.name";
import { DbService } from "../../@shared/service/db.service";
import { SfAccountVo, SfCaseVo } from "cybersafepolicy-core";

export class CaseService extends DbService {

    /* ************************************* Constructor ******************************************** */
    constructor() {
        super(TABLE.CASE);
    }

    /* ************************************* Public Methods ******************************************** */
    public addUpdateCase = async (vo: SfCaseVo): Promise<SfCaseVo> => {
        try {
            return await this.addUpdateRow<SfCaseVo>(vo);
        } catch (error) {
            throw error;
        }
    }

    /* ************************************* Private Methods ******************************************** */
    private _sanatize(vo: SfAccountVo | any) {
        // if (vo.PhotoUrl !== undefined) {
        //     delete vo.PhotoUrl;
        // }
        // if (vo.BillingAddress !== undefined) {
        //     delete vo.BillingAddress;
        // }
        // if (vo.LastActivityDate !== undefined) {
        //     delete vo.LastActivityDate;
        // }
        // if (vo.JigsawCompanyId !== undefined) {
        //     delete vo.JigsawCompanyId;
        // }
        // if (vo.MasterRecordId !== undefined) {
        //     delete vo.MasterRecordId;
        // }
        // if (vo.npsp__Membership_Span__c !== undefined) {
        //     delete vo.npsp__Membership_Span__c;
        // }
        // if (vo.npsp__Membership_Status__c !== undefined) {
        //     delete vo.npsp__Membership_Status__c;
        // }
        // if (vo.ShippingAddress !== undefined) {
        //     delete vo.ShippingAddress;
        // }
        // return vo;
    }
}