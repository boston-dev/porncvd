const NowPaymentsMPApi = require('@nowpaymentsio/nowpayments-mass-payments-api-js');

const api = new NowPaymentsMPApi({ apiKey: 'V6TT6T8-G0R43R9-NGA6QKE-81W24Y1' }) // your api key
async function logBalance() {
  const { token } = await api.auth({ email: 'armandolailah70591@gmail.com', password:'Arman705' })
  const balance = await api.getBalance({ token })
  console.log('Get balance: ', balance)
}
logBalance()