import App from './app';
import IndexApi from './@app/api/index.api';
import UserApi from './@app/api/user.api';
import PromoCodeApi from './@app/api/promo-code.api';
import AuthApi from './@app/api/auth.api';
import ArtFundApi from './@app/api/art-fund.api';
import CaseApi from './@app/api/case.api';
import DonationApi from './@app/api/donation.api';

const app = new App([
    new IndexApi(),
    new PromoCodeApi(),
    new UserApi(),
    new AuthApi(),
    new ArtFundApi(),
    new CaseApi(),
    new DonationApi()
]);

app.listen();
