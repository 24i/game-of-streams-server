import bodyParser from 'body-parser';
import express from 'express';
import Stripe from 'stripe';
import axios from 'axios';

const app = express();

const pauseTrashHold = 5 * 1000;

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
	  'Access-Control-Allow-Headers',
	  'Origin, X-Requested-With, Content-Type, Accept'
	);
	next();
  });
  
const port = 3000;

//Confirm the API version from your stripe dashboard

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
	// const response = await axios.post(
	// 	'https://backstage-api.com/user/login',
	// 	{ password: "qwerty123456", username: "johndoe@example.com" },
	// 	{
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'x-service-id': '5e0ad1b0-515e-11e9-a7ed-371ac744bd33',
	// 			'x-application-id': '67eae630-d7ec-11ea-9077-3fff30e06028'

	// 		}
	// 	}
	// );
	res.send(response.data);
});

const getUserDbEntry = (req) => {
	const entry = fakeDb[req.body.userId];
	if (!entry) fakeDb[req.body.userId] = {};
	return fakeDb[req.body.userId];
}

app.post('/event', async (req, res) => {
	const userDatabaseEntry = getUserDbEntry(req);
	const timeFromLastHeartbeat = req.body.timestamp - (userDatabaseEntry.lastEventTimeStamp || req.body.timestamp);
	userDatabaseEntry.lastEventTimeStamp = req.body.timestamp;
	userDatabaseEntry.totalTimeWatched = timeFromLastHeartbeat + (userDatabaseEntry.totalTimeWatched || 0);
	console.log(userDatabaseEntry.totalTimeWatched);
	res.status(200).send('OK');
});

app.get('/users/:userId/points/', async (req, res) => {
	const userDatabaseEntry = getUserDbEntry(req.params.userId);
	const points  =  Math.round(userDatabaseEntry.totalTimeWatched / 100);
	res.json({ pointValue: points });
});

app.get('/user/events', async (req, res) => {

});

