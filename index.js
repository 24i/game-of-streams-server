import bodyParser from 'body-parser';
import express from 'express';
import Stripe from 'stripe';
import axios from 'axios';

const app = express();
const port = 3000;

//FIXME: replace this one
const STRIPE_SECRET_KEY =
	'sk_test_51HkDYWBF0fvtYVwRCRZkn9igpqFG4apdgbKQYsvnPE4YwKNwte6xrAiaWG2GuVJTAjckHu9d3htsm6bBYlEJTGH700mwKer6zm';

export const STRIPE_PUBLISHABLE_KEY =
	'pk_test_51HkDYWBF0fvtYVwRcX99ok7PzCJeNXv8VLa5beAmp7ZzLThkst58FG2m1IjMzzJwvZSegP1zwH4w8ABZc0ooPl6i0067qOvfbk';

//Confirm the API version from your stripe dashboard
const stripe = Stripe(STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.listen(port, () => {
	console.log(`Pealock server listening at http://localhost:${port}`);
});

const fakeDb = {};

const calculatePointsForuser = {

}

// config
app.get('/login', async (req, res) => {
	fakeDb[Date.now()] = { text: 'hello world' };
	// await express.request('http://www.google.com/');
	const response = await axios.post(
		'https://backstage-api.com/user/login',
		{ password: "qwerty123456", username: "johndoe@example.com" },
		{
			headers: {
				'Content-Type': 'application/json',
				'x-service-id': '5e0ad1b0-515e-11e9-a7ed-371ac744bd33',
				'x-application-id': '67eae630-d7ec-11ea-9077-3fff30e06028'

			}
		}
	);
	res.send(response.data);
});

app.post('/event', async (req, res) => {
	fakeDb['events'][req.event.id] = res;
});

app.get('/user/points', async (req, res) => {

});

app.get('/user/events', async (req, res) => {

});

app.post('/create-payment-intent', async (req, res) => {
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: 1099, //lowest denomination of particular currency
			currency: 'usd',
			payment_method_types: ['card'], //by default
		});

		const clientSecret = paymentIntent.client_secret;

		res.json({
			clientSecret: clientSecret,
		});
	} catch (e) {
		res.json({ error: e.message });
	}
});

app.post('/create-customer', async (req, res) => {
	const { email, payment_method } = req.body;

	try {
		const customer = await stripe.customers.create({
			payment_method: payment_method,
			email: email, // email or whatever
			invoice_settings: {
				default_payment_method: payment_method,
			},
		});
		res.json({ customer });
	} catch (e) {
		res.json({ error: e.message });
	}
});

// fetch the list of customer subscriptions
app.post('/user-subscriptions', async (req, res) => {
	const { customerId } = req.body;

	const subscriptions = await stripe.subscriptions.list({
		customer: customerId,
		status: 'all',
		expand: ['data.default_payment_method'],
	});

	res.json({ subscriptions });
});

// fetch the list of products
app.post('/product-list', async (req, res) => {
	const { productIds } = req.body;
	const products = await stripe.products.list({ ids: productIds || [] });

	res.json({ products });
});

// fetch the product prices
app.post('/product-prices', async (req, res) => {
	const { productId } = req.body;
	const prices = await stripe.prices.list({
		product: productId,
	});

	res.json({ prices });
});

app.post('/create-subscription', async (req, res) => {
	const { customerId, productId } = req.body;

	try {
		const subscription = await stripe.subscriptions.create({
			customer: customerId,
			items: [{ plan: productId }],
			expand: ['latest_invoice.payment_intent'],
		});

		const status = subscription.latest_invoice.payment_intent.status;
		const clientSecret =
			subscription.latest_invoice.payment_intent.client_secret;

		res.json({ clientSecret, status, subscription });
	} catch (e) {
		res.json({ error: e.message });
	}
});

// Cancel the subscription
app.post('/cancel-subscription', async (req, res) => {
	const { subscriptionId } = req.body;
	try {
		const deletedSubscription = await stripe.subscriptions.del(subscriptionId);
		res.send({ subscription: deletedSubscription });
	} catch (error) {
		return res.status(400).send({ error: { message: error.message } });
	}
});

//TODO: not implemented yet
app.post('/update-subscription', async (req, res) => {
	try {
		const subscription = await stripe.subscriptions.retrieve(
			req.body.subscriptionId
		);
		const updatedSubscription = await stripe.subscriptions.update(
			req.body.subscriptionId,
			{
				items: [
					{
						id: subscription.items.data[0].id,
						price: process.env[req.body.newPriceLookupKey.toUpperCase()],
					},
				],
			}
		);

		res.send({ subscription: updatedSubscription });
	} catch (error) {
		return res.status(400).send({ error: { message: error.message } });
	}
});
