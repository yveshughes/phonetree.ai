import * as jsforce from 'jsforce';
import * as dotenv from "dotenv";
import { RecordResult, SfDate } from 'jsforce';
const connection = new jsforce.Connection({});

export class DbService {
    table: string;
    /* ************************************* Constructor ******************************************** */
    constructor(table: string) {
        this.table = table;
    }

    /* ************************************* Public Methods ******************************************** */
    public queryByField = async (fieldName: string, fieldValue: any): Promise<any> => {
        try {
            await this.connectToDb();
            const condition = {} as any;
            condition[fieldName] = fieldValue;
            return await connection.sobject(this.table).find(condition);
        } catch (error) {
            throw error;
        }
    };

    public queryById = async (id: string): Promise<any> => {
        try {
            await this.connectToDb();
            return await connection.sobject(this.table).retrieve(id);
        } catch (error) {
            throw error;
        }
    }

    public description = async (): Promise<any> => {
        try {
            await this.connectToDb();
            return await connection.describe(this.table);
        } catch (error) {
            throw error;
        }
    }

    public removeById = async (id: string): Promise<boolean> => {
        try {
            await this.connectToDb();
            const res = await connection.sobject(this.table).destroy(id);
            return res.success;
        } catch (error) {
            throw error;
        }
    }

    public updateFieldByKey = async (Id: string, fieldName: string, fieldValue: any): Promise<boolean> => {
        try {
            await this.connectToDb();
            const condition = {} as any;
            condition[fieldName] = fieldValue;
            condition.Id = Id;
            const ret = await connection.sobject(this.table).update(condition) as RecordResult;
            return ret.success;
        } catch (error) {
            throw error;
        }
    };

    public updateTwoFieldByKey = async (Id: string, fieldName1: string, fieldValue1: any, fieldName2: string, fieldValue2: any): Promise<boolean> => {
        try {
            await this.connectToDb();
            const condition = {} as any;
            condition[fieldName1] = fieldValue1;
            condition[fieldName2] = fieldValue2;
            condition.Id = Id;
            const ret = await connection.sobject(this.table).update(condition) as RecordResult;
            return ret.success;
        } catch (error) {
            throw error;
        }
    };

    public addUpdateRow = async <T extends { Id?: string }>(dto: T): Promise<T> => {
        try {
            await this.connectToDb();
            const obj = connection.sobject(this.table);
            let result = {} as RecordResult;
            if (dto.Id) {
                result = await obj.update(dto);
            } else {
                result = await obj.create(dto);
            }
            if (result.success) {
                return await this.queryById(result.id);;
            } else {
                throw result.errors;
            }
            return dto;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public batchUpdate = async <T extends { Id?: string }>(list: Array<T>): Promise<Array<string>> => {
        try {
            await this.connectToDb();
            const obj = connection.sobject(this.table);
            const ret = await obj.update(list, { allOrNone: false });
            const ids: Array<string> = [];
            if (Array.isArray(ret)) {
                ret?.forEach(it => {
                    if (it.success) {
                        ids.push(it.id as string);
                    }
                });
            }
            return ids;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public today = (d: Date): SfDate => {
        return jsforce.SfDate.toDateLiteral(d);
    }

    public queryByFieldSoql = async (fieldName: string, fieldValue: SfDate, columns: Array<string>): Promise<any> => {
        try {
            await this.connectToDb();
            const query = `SELECT ${columns.join(', ')} FROM ${this.table} WHERE ${fieldName} = ${fieldValue}`;
            console.log(query);
            return (await connection.query(query)).records;
        } catch (error) {
            throw error;
        }
    }

    public getConnection = async (): Promise<jsforce.Connection> => {
        try {
            await this.connectToDb();
            return connection;
        } catch (error) {
            throw error;
        }
    }

    public uploadContentVersion = async (fileName: string, file: Buffer): Promise<jsforce.RecordResult> => {
        await this.connectToDb();
        return connection.sobject('ContentVersion').create({
            PathOnClient: fileName,
            VersionData: file.toString('base64')
        });
    }


    /* ************************************* Private Methods ******************************************** */
    private connectToDb = async () => {
        dotenv.config();
        const email = process.env.EMAIL as string;
        const password = process.env.PASSWORD;
        const token = process.env.TOKEN;
        const key = `${password}${token}`;
        await connection.login(email, key);
    }
}