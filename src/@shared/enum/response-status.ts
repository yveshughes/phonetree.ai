/*
ResponseStatus.FAIL == 1 // index
ResponseStatus[ResponseStatus.FAIL] == 'FAIL' //value

JS
  ResponseStatus[ResponseStatus['FAIL'] = 1] = 'FAIL';
 */
export enum ResponseStatus {
    SUCCESS, FAIL, ERROR
}
