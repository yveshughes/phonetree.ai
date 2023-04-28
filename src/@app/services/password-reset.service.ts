import { TABLE } from "../const/table.name";
import { DbService } from "../../@shared/service/db.service";
import { SfOpportunityVo, SfPasswordResetVo } from "cybersafepolicy-core";
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from "dotenv";
import * as jwt from 'jsonwebtoken';

export class PasswordResetService extends DbService {

    /* ************************************* Constructor ******************************************** */
    constructor() {
        super(TABLE.RESET_PASSWORD);
    }

    /* ************************************* Public Methods ******************************************** */
    public addUpdateResetPassword = async (vo: SfPasswordResetVo): Promise<SfPasswordResetVo> => {
        try {
            return await this.addUpdateRow<SfPasswordResetVo>(vo);
        } catch (error) {
            throw error;
        }
    }

    public getResetPassword = async (email: string): Promise<SfPasswordResetVo | null> => {
        try {
            const list = await this.queryByField('Email__c', email);
            if (list?.length > 0) {
                return list[0];
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    public getResetPasswordByUserId = async (id: string): Promise<SfPasswordResetVo | null> => {
        try {
            const list = await this.queryByField('Opportunity__c', id);
            if (list?.length > 0) {
                return list[0];
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    public deleteResetPassword = async (id: string): Promise<boolean> => {
        try {
            return await this.removeById(id);
        } catch (error) {
            throw error;
        }
    }

    public savePasswordResetVo = async (user: SfOpportunityVo): Promise<SfPasswordResetVo> => {
        const ret = {} as SfPasswordResetVo;
        ret.Name = uuidv4();
        ret.Email__c = user.Email__c;
        ret.Opportunity__c = user.Id;
        ret.Link__c = this._getResetLink(user.Id);
        return await this.addUpdateResetPassword(ret);
    }

    /* ************************************* Private Methods ******************************************** */
    private _getResetLink(id: string): string {
        const dto = {} as any;
        dto.id = id;
        dto.date = new Date().getTime().toString();
        dotenv.config();
        const secret = process.env.JWT_SECRET as string;
        return jwt.sign(dto, secret, { expiresIn: '24h' });
    }
}