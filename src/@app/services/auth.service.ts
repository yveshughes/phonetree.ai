import { JwtClaimDto, SfOpportunityVo, UserAccessDto } from "cybersafepolicy-core";
import { OpportunityService } from "./opportunity.service";
import * as dotenv from "dotenv";
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class AuthService {
    /* ************************************* Constructor ******************************************** */
    constructor() {
    }

    /* ************************************* Public Methods ******************************************** */
    public getAccessToken = async (user: SfOpportunityVo | null): Promise<string | null> => {
        try {
            if (user) {
                return this._getAccessToken(user);
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    public authenticate = async (email: string, password: string): Promise<UserAccessDto | null> => {
        try {
            const opportunityService = new OpportunityService();
            const user: SfOpportunityVo | null = await opportunityService.getUserByEmail(email);
            if (user && user.Id) {
                const dto = {} as UserAccessDto;
                if (user.Reset_Password__c === true) {
                    dto.changePassword = true;
                    dto.token = "";
                } else {
                    const passwordValid = await this._validatePassword(user.Password__c, password);
                    if (passwordValid === true) {
                        dto.changePassword = false;
                        dto.token = this._getAccessToken(user);
                    }
                }
                return dto;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    /* ************************************* Private Methods ************************************ */
    private _getAccessToken(user: SfOpportunityVo): string {
        dotenv.config();
        const secret = process.env.JWT_SECRET as string;
        return jwt.sign(this._getJwtClaim(user), secret, { expiresIn: '5h' });
    }

    private _getJwtClaim(user: SfOpportunityVo): JwtClaimDto {
        const dto = {} as JwtClaimDto;
        dto.iss = 'auth0';
        dto.aud = 'cybersafepolicy';
        dto.sub = user.AccountId;
        dto.name = user.First_Name__c + ' ' + (user.Last_Name__c || '');
        dto.cuid = user.Id;
        dto.email = user.Email__c;
        dto.email_verified = true;
        dto.subscription = user.Subscription_Type__c;
        dto.status = user.Status__c;
        return dto;
    }

    private _validatePassword = async (encryptPassword: string, password: string): Promise<boolean> => {
        return await bcrypt.compare(password, encryptPassword);
    }
}

