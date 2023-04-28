import moment from "moment";

export class MomentService {
    /* ************************************* static field ******************************************** */
    /* ************************************* Constructor ******************************************** */
    /* ************************************* Public Methods ******************************************** */
    public static addMonthToDate(date: Date, amount: number): Date {
        return moment(date).add(amount, 'M').toDate();
    }

    public static addYearToDate(date: Date, amount: number): Date {
        return moment(date).add(amount, 'y').toDate();
    }

    public static addDaysToDate(date: Date, amount: number): Date {
        return moment(date).add(amount, 'days').toDate();
    }

    public static isTodaysDate(date: Date | null): boolean {
        if (!date) {
            return false;
        }
        return moment(date).isSame(moment(), 'day');
    }

    /* ************************************* Private Methods ******************************************** */
}