import Queue from 'bull';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue');
fileQueue.process(async (job, done) => {
  if (!job) {
    done(new Error('Missing job'));
    return;
  }
  if (job.data.fileId === undefined) {
    done(new Error('Missing fileId'));
    return;
  }
  if (job.data.userId === undefined) {
    done(new Error('Missing userId'));
    return;
  }

  const imageFileObject = await dbClient.findUserFile(job.data.userId, job.data.fileId);
  if (!imageFileObject) {
    done(new Error('File not found'));
  }
});

export default fileQueue;
