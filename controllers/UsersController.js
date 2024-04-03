import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const crypto = require('crypto');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    const { usersCollection } = dbClient;
    const user = await usersCollection.findOne({ email });

    if (user) {
      return res.status(400).send({ error: 'Already exist' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const newUser = await usersCollection.insertOne({
      email,
      password: hashedPassword,
    });

    return res.status(201).send({ id: newUser.insertedId, email });
  }

  static async getMe(request, response) {
    const userSessionToken = request.get('X-Token');
    // console.log(userSessionToken);

    if (typeof userSessionToken !== 'string') {
      response.status(401);
      response.send({ error: 'Unauthorized' });
      return;
    }

    const userId = await redisClient.getUserId(userSessionToken);
    // console.log(`userId: ${userId}`);

    if (typeof userId !== 'string') {
      response.status(401);
      response.send({ error: 'Unauthorized' });
      return;
    }

    const userObject = await dbClient.userById(userId);
    // console.log(`userObject: ${userObject}`);

    if (typeof userObject !== 'object') {
      response.status(401);
      response.send({ error: 'Unauthorized' });
      return;
    }

    response.send({ id: userObject._id, email: userObject.email });
  }
}

module.exports = UsersController;
