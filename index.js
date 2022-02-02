import bodyParser from 'body-parser';
import express from 'express';
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
app.get('/users/login', async (req, res) => {
	const { username, password } = req.query;
	const token = await getToken(username, password);
	const response = await axios.get(
		'https://backstage-api.com/user',
		{
			headers: {
				'Content-Type': 'application/json',
				'x-service-id': '5e0ad1b0-515e-11e9-a7ed-371ac744bd33',
				'x-application-id': '67eae630-d7ec-11ea-9077-3fff30e06028',
				Authorization: `Bearer ${token}`,
			}
		}
	);
	try {
	const profiles = await axios.get(
		'https://backstage-api.com/user/profiles',
		{
			headers: {
				'Content-Type': 'application/json',
				'x-service-id': '5e0ad1b0-515e-11e9-a7ed-371ac744bd33',
				'x-application-id': '67eae630-d7ec-11ea-9077-3fff30e06028',
				Authorization: `Bearer ${token}`,
			}
		}
	);
	res.json({ ...response.data.user, profile: profiles.data.find(profile => profile.selected) });
	} catch (e) {
		console.log(e);
	}
});

const getToken = async (username = 'johndoe@example.com', password = 'qwerty123456') => {
	const response = await axios.post(
		'https://backstage-api.com/user/login',
		{ password, username},
		{
			headers: {
				'Content-Type': 'application/json',
				'x-service-id': '5e0ad1b0-515e-11e9-a7ed-371ac744bd33',
				'x-application-id': '67eae630-d7ec-11ea-9077-3fff30e06028'

			}
		}
	);
	return response.data.token;
}

const getUserDbEntry = (userId) => {
	const entry = fakeDb[userId];
	if (!entry) fakeDb[userId] = {};
	return fakeDb[userId];
}

app.post('/event', async (req, res) => {
	const userDatabaseEntry = getUserDbEntry(req.body.userId);
	userDatabaseEntry.userDetails = req.body.user;
	const timeFromLastHeartbeat = req.body.timestamp - (userDatabaseEntry.lastEventTimeStamp || req.body.timestamp);
	userDatabaseEntry.lastEventTimeStamp = req.body.timestamp;
	userDatabaseEntry.totalTimeWatched = timeFromLastHeartbeat + (userDatabaseEntry.totalTimeWatched || 0);
	const points  =  Math.round(userDatabaseEntry.totalTimeWatched / 100);
	userDatabaseEntry.totalPoints = points;
	res.status(200).send('OK');
});

app.get('/users/:userId/points/', async (req, res) => {
	const userDatabaseEntry = getUserDbEntry(req.params.userId);
	res.json({ pointValue: userDatabaseEntry.points || 0 });
});

app.get('/users/:userId/lastwatched/', async (req, res) => {
	const { username, password } = req.query;
	const token = await getToken(username, password);
	const response = await axios.get(
		'https://backstage-api.com/playlists/watch-history',
		{
			headers: {
				'Content-Type': 'application/json',
				'x-service-id': '5e0ad1b0-515e-11e9-a7ed-371ac744bd33',
				'x-application-id': '67eae630-d7ec-11ea-9077-3fff30e06028',
				Authorization: `Bearer ${token}`,
			}
		}
	);
	return res.json(response.data.items);
});

app.get('/users/:userId/', async (req, res) => {
	const userDatabaseEntry = getUserDbEntry(req.params.userId);
	res.json({ userDatabaseEntry });
});

app.get('/users', async (req, res) => {
	const values = Object.values(fakeDb);
	res.json(values);
});

app.get('/user/events', async (req, res) => {

});

