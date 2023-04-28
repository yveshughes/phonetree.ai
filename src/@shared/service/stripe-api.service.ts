import * as dotenv from "dotenv";
import Stripe from 'stripe';

export class StripeApiService {


    /* ************************************* static field ******************************************** */
    private stripe: Stripe;
    private currency = 'usd';

    /* ************************************* Constructor ******************************************** */
    constructor() {
        dotenv.config();
        this.stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY as string, {
            apiVersion: '2020-08-27',
        });
    }

    /* ************************************* Public Methods ******************************************** */
    public async createPaymentIntent(paymentMethodId: string, amount: number): Promise<string> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                payment_method: paymentMethodId,
                amount: amount,
                currency: this.currency,
                capture_method: 'manual',
                confirm: true,
            });
            return paymentIntent.id;
        } catch (error) {
            throw error;
        }
    }

    public async capturePaymentIntent(paymentIntentId: string): Promise<number> {
        try {
            const capture = await this.stripe.paymentIntents.capture(paymentIntentId);
            return capture.amount_received;
        } catch (error) {
            throw error;
        }
    }

    public async payByPaymentMethod(paymentMethodId: string, amount: number, email: string, stripeCust: string, metadata = {}): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                payment_method: paymentMethodId,
                amount: amount,
                currency: this.currency,
                confirm: true,
                receipt_email: email,
                customer: stripeCust,
                metadata: metadata
            });
            return paymentIntent;
        } catch (error) {
            throw error;
        }
    }

    public async createCustomer(email: string, name: string): Promise<string> {
        try {
            const customer = await this.stripe.customers.create({
                email: email,
                name: name
            });
            return customer.id;
        } catch (error) {
            throw error;
        }
    }

    public async attachPaymentMethodToCustomer(customerId: string, paymentMethodId: string): Promise<boolean> {
        try {
            const attachPaymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    public async listPaymentMethod(customerId: string): Promise<string> {
        try {
            const pm = await this.stripe.customers.listPaymentMethods(
                customerId,
                { type: 'card', limit: 1 }
            );
            return pm.data?.length > 0 ? pm.data[0].id : '';
        } catch (error) {
            throw error;
        }
    }

    /* ************************************* Private Methods ******************************************** */
}