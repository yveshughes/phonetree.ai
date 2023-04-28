// import { Message } from './message';
// import { MessageType } from "../enums";
// import { MessageService } from "../service/message.service";
import { ResponseStatus } from '../enum/response-status';

/**
 * ApiResponse
 */
export class ApiResponse<T> {

    /* ************************************ Instance Fields ************************************ */
    code: number;
    status: string;
    body: T | null;
    data: any; // Map<String, Object>
    msg: string | null; // List<Message>
    errorMessage: string | null;

    /* ************************************ Constructors ************************************ */
    constructor() {
        this.code = 200;
        this.status = ResponseStatus[ResponseStatus.SUCCESS];
        this.body = null;
        this.data = null;
        this.msg = null;
        this.errorMessage = null;
    }
}
