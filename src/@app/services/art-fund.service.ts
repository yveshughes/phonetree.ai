import { TABLE } from "../const/table.name";
import { DbService } from "../../@shared/service/db.service";
import { SfAccountArtFunDto, SfArtsFundsVo, SfOpportunityVo } from "cybersafepolicy-core";
import { OpportunityService } from "./opportunity.service";
import { AccountService } from "./account.service";

export class ArtFundService extends DbService {

    /* ************************************* Constructor ******************************************** */
    constructor() {
        super(TABLE.ART_FUND);
    }

    /* ************************************* Public Methods ******************************************** */
    public addUpdateArtFund = async (dto: SfAccountArtFunDto): Promise<SfAccountArtFunDto> => {
        try {
            const opportunity: SfOpportunityVo = await new OpportunityService().queryById(dto.artFund.Opportunity__c);
            dto.acc.Id = opportunity.AccountId;
            dto.acc = await new AccountService().addUpdateAccount(dto.acc);
            dto.artFund.Organization__c = dto.acc.Id;
            this._sanatizeOnUpdate(dto.artFund);
            dto.artFund = await this.addUpdateRow<SfArtsFundsVo>(dto.artFund);
            return dto;
        } catch (error) {
            throw error;
        }
    }

    public getDetail = async (userId: string): Promise<SfAccountArtFunDto> => {
        const opportunity: SfOpportunityVo = await new OpportunityService().queryById(userId);
        const dto = {} as SfAccountArtFunDto;
        try {
            const list = await this.queryByField('Opportunity__c', opportunity.Id);
            if (list && list.length > 0) {
                dto.artFund = list[0];
            }
        } catch (e) {
            dto.artFund = {} as SfArtsFundsVo;
        }
        dto.acc = await new AccountService().queryById(opportunity.AccountId);
        return dto;
    }

    /* ************************************* Private Methods ******************************************** */
    private _sanatizeOnUpdate(vo: any): void {
        if (!vo.Id) {
            return;
        }
        if (vo.Name !== undefined) {
            delete vo.Name;
        }
        if (vo.Organization__c !== undefined) {
            delete vo.Organization__c;
        }
        if (vo.LastActivityDate !== undefined) {
            delete vo.LastActivityDate;
        }
    }
}