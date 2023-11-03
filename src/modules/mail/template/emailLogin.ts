import * as Mailgen from 'mailgen';

interface MailBody {
    productName: string;
    productWebUrl: string;
    receiverName: string;
    language: string;
}

function getEmailLogin(mailBody: MailBody) {
    let mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: mailBody.productName,
            link: mailBody.productWebUrl
        }
    });

    let email = {
        body: {
            greeting: "Hello",
            signature: "Xin Chân Thành Cảm Ơn",
            name: mailBody.receiverName,
            intro: `Chúng tôi là ${mailBody.productName}, Tài khoản của đã đăng nhập`,
            // Không có phần button ở đây
        }
    };

    return mailGenerator.generate(email);
}

export default getEmailLogin;
