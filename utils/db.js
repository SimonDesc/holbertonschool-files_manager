import { MongoClient, ObjectId } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

/**
 * Class for performing operations with Mongo service
 */
class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        this.db = client.db(DB_DATABASE);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      } else {
        console.log(err.message);
        this.db = false;
      }
    });
  }

  isAlive() {
    if (this.db) {
      return true;
    }
    return false;
  }

  async nbUsers() {
    const numberOfUsers = this.usersCollection.countDocuments();
    return numberOfUsers;
  }

  async nbFiles() {
    const numberOfFiles = this.filesCollection.countDocuments();
    return numberOfFiles;
  }

  async userById(id) {
    try {
      const _id = ObjectId(id);

      return await this.usersCollection.findOne({ _id });
    } catch (error) {
      return null;
    }
  }

  async fileWithID(id) {
    let _id;
    try {
      _id = ObjectId(id);
    } catch (error) {
      return null;
    }
    return this.filesCollection.findOne({ _id });
  }

  async addFile(file) {
    return this.filesCollection.insertOne(file);
  }

  async findUserFile(userId, id) {
    const query = {};

    try {
      query.userId = ObjectId(userId);
      query._id = ObjectId(id);
    } catch (error) {
      return null;
    }
    return this.filesCollection.findOne(query);
  }

  async setFilePublic(userId, id, isPublic) {
    const filter = {};
    try {
      filter.userId = ObjectId(userId);
      filter._id = ObjectId(id);
    } catch (error) {
      /* I think it should be not found anyways */
    }
    return this.filesCollection.updateOne(
      filter,
      { $set: { isPublic } },
    );
  }
}

const dbClient = new DBClient();

export default dbClient;
