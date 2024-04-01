import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    // console.log(redisClient)
    // console.log(dbClient)
    const redisAlive = redisClient ? redisClient.isAlive() : false;
    const dbAlive = dbClient ? dbClient.isAlive() : false;
    res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    // console.log(users)
    res.status(200).json({ users, files });
  }
}

module.exports = AppController;
