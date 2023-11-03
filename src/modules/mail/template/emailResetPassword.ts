import * as Mailgen from 'mailgen';

interface MailBody {
    productName: string;
    productWebUrl: string;
    receiverName: string;
    confirmLink: string;
    language: string;
}

function getemailReset(mailBody: MailBody) {
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
            intro: `Chúng tôi là ${mailBody.productName}`,
            action: {
                instructions: `Xin chào, Chúng tôi được yêu cầu thay đổi mật khẩu của bạn vui lòng bấm xác nhận để có thể thay đổi mật khẩu!`,
                button: {
                    color: '#22BC66',
                    text: "Xác nhận",
                    link: mailBody.confirmLink
                }
            },
            // outro: `Outro`
        }
    };

    return mailGenerator.generate(email);
}

export default getemailReset;