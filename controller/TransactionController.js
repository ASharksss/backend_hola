const crypto = require('crypto');

const {Transaction, Publication, Publication_buy} = require("../models/models");
const {Basket} = require("../models/models");
const {PRODUCT_URL, postData, receipt} = require("../utils");

class TransactionController {

    async payAd(req, res, next) {
        try {
            const user = req.user

            const basket = await Basket.findAll({
                where: {userId: user.id},
                include: {
                    model: Publication,
                    attributes: ['id', 'price']
                }
            });

            let totalPrice = 0;

            for(const post of basket){
                totalPrice += Number(post.publication.price);
            }


            const transaction = await Transaction.create({
                            userId: user.id,
                            ivnID: null,
                            status_string: 'pending',
                            status: false,
                            purchaseCost: totalPrice,
            })
            if(!transaction){
                return res.status(500).json({error: "Transaction not found", url: `${PRODUCT_URL}/pay/error`})
            } // идет загрузка на клиенте

            const updateBasket = await Basket.update(
                {transactionId: transaction.id},
                {where: {userId: user.id}}
            )
            if(!updateBasket){
                return res.status(500).json({error: "Basket updating is failed", url: `${PRODUCT_URL}/pay/error`})
            } // идет загрузка на клиенте

            const robokassaLogin = process.env.ROBOKASSA_LOGIN
            const robokassaIsTest = process.env.ROBOKASSA_IS_TEST || 1
            const robokassaPassword = process.env.ROBOKASSA_PASSWORD_1

            // https://docs.robokassa.ru/testing-mode/ Документация для тестового

            const receiptData = receipt('Оплата постов', totalPrice)
            const receiptURLEncode = encodeURIComponent(JSON.stringify(receiptData)).replace(/%3A/g, ":").replace(/%2C/g, ",")
            let crcData = `${robokassaLogin}:${totalPrice}:${transaction.id}:${receiptURLEncode}:${robokassaPassword}`
            const crc = crypto.createHash('md5').update(crcData).digest("hex");

            const invoice = await postData(robokassaLogin, totalPrice, transaction.id, receiptURLEncode, crc, user.email, robokassaIsTest)
                .then(async data => {
                    return data?.invoiceID;
                })
                .catch(error => {
                    console.warn('Ошибка при выполнении запроса:', error);
                });
            const ads = `https://auth.robokassa.ru/Merchant/Index/${invoice}`
            // console.log(ads)
            return res.json(ads)
        } catch (e) {
            console.log(e)
            return next('some Error')
        }
    }

    async success(req, res, next) {
        try {
            const {OutSum, InvId, SignatureValue} = req.query
            const robokassaPassword = process.env.ROBOKASSA_PASSWORD_1

            const transaction = await Transaction.update({
                status: true,
                status_string: 'success',
                invId: SignatureValue
            },{where: {id: InvId}})

            const basket = await Basket.findAll({where: {transactionId: InvId}})

            for(let post of basket){
                const post_buy = await Publication_buy.create({
                    userId: basket.userId,
                    publicationId: post.publicationId,
                    transactionId: transaction.id,
                })
                if(!post_buy){console.log('error buy add')}
            }

                                 // if (!booking) return res.json({message: 'oshibka, ne nashel zakaz'});

            let crcData = `${OutSum}:${InvId}:${robokassaPassword}`
            const crc = crypto.createHash('md5').update(crcData).digest("hex");
            if (crc !== SignatureValue) return res.json({message: 'Ошибка'})

                            // await Booking.update({isActive: 1}, {where: {id: InvId}})
                            // await Ad.update({statusAdId: 2}, {where: {id: booking['adId']}})

            return res.redirect(`${PRODUCT_URL}/publications/available`)

        } catch (e) {
            console.log(e.message)
            return next(ApiError.badRequest(e.message))
        }
    }

    async error(req, res, ) {
        try {
            const {InvId} = req.query;
            await Transaction.destroy({where: {invId: InvId}})
                .catch((e) => res.status(500).json({message: `${e}`}));

            return res.redirect(`${PRODUCT_URL}/pay/error`)
        } catch (e) {
            // console.log(e.message)
            return res.status(500).json({error: e.message})
        }
    }
}

module.exports = new TransactionController()