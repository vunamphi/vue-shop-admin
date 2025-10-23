const { VNPay, ignoreLogger } = require("vnpay");

const VNP_TMN_CODE = process.env.VNP_TMN_CODE;
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET;
const VNP_URL = process.env.VNP_URL;
const VNP_HOST = process.env.VNP_HOST;
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || "http://localhost:5173/thankyou";

const vnpay = new VNPay({
  tmnCode: VNP_TMN_CODE,
  secureSecret: VNP_HASH_SECRET,
  vnpayHost: VNP_HOST,
  testMode: true,
  hashAlgorithm: "SHA512",
  enableLog: true,
  loggerFn: ignoreLogger,
  endpoints: {
    paymentEndpoint: "paymentv2/vpcpay.html",
    getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list',
  },
});

module.exports = { vnpay, VNP_URL, VNP_RETURN_URL, VNP_HASH_SECRET };