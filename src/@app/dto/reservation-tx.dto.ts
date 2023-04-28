import { ReservationVo } from "@app/vo/reservation.vo";

export interface ReservationTxDto extends ReservationVo {
    txList: Array<any>
}