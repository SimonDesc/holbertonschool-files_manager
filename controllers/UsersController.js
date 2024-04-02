import dbClient from '../utils/db';

const crypto = require('crypto');

class UsersController {
  static async postNew(req, res) {
    // console.log(req.body)
    const { email, password } = req.body;
    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });

    // if the email already exists in DB, return an error Already exist with a status code 400
    const { usersCollection } = dbClient;
    const user = await usersCollection.findOne({ email });
    if (user) return res.status(400).send({ error: 'Already exist' });

    // The password must be stored after being hashed in SHA1
    const shasum = crypto.createHash('sha1');
    shasum.update(password);
    const hashedPassword = shasum.digest('hex');
    const newUser = await usersCollection.insertOne({
      email,
      password: hashedPassword,
    });
    // console.log(newUser.insertedId, email);
    return res.status(201).send({ id: newUser.insertedId, email });
  }
}

module.exports = UsersController;
