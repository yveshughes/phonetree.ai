import { ResponseStatus } from "../enum/response-status";
import { ApiResponse } from "../interface/api-response";
import { Response } from "express";

export class ResponseUtility {

  public static sendSuccess(res: Response, body: any, msg: string = '') {
    const apiResponse = new ApiResponse();
    apiResponse.body = body;
    apiResponse.code = 200;
    apiResponse.status = ResponseStatus[ResponseStatus.SUCCESS];
    apiResponse.msg = msg;
    res.status(200).send(apiResponse);
  }

  public static sendFailResponse(res: Response, e: any, msg: string = '', code: number = 500) {
    const apiResponse = new ApiResponse();
    apiResponse.body = e;
    apiResponse.code = code;
    apiResponse.msg = msg;
    apiResponse.status = ResponseStatus[ResponseStatus.FAIL];
    res.status(code).send(apiResponse);
  }
}