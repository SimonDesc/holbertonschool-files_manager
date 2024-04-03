import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const crypto = require('crypto');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // On récupère les credentials de l'utilisateur (base64)
    const encodedCredentials = authHeader.split(' ')[1];
    // On décode
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    // Et on split par rapport au ':'
    const [email, password] = decodedCredentials.split(':');

    // On cherche l'utilisateur
    const user = await dbClient.usersCollection.findOne({ email });
    // Si l'utilisateur n'existe pas ou que le mot de passe ne correspond pas
    if (!user || user.password !== crypto.createHash('sha1').update(password).digest('hex')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Sinon, on génère un token de connexion
    const token = uuidv4();
    const key = `auth_${token}`;
    
    // On stocke le token dans Redis pour 24h
    await redisClient.set(key, user._id.toString(), 86400);

    // On retourne le token
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

module.exports = AuthController;
