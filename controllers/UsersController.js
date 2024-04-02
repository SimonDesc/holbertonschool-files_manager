import dbClient from '../utils/db';

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
}

module.exports = UsersController;
