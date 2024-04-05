import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import fileQueue from '../worker';

const { mkdir, writeFile } = fsPromises;
const fs = require('fs');

class FilesController {
  static async postUpload(request, response) {
    // On récupère le token de l'utilisateur
    const userToken = request.get('X-Token');
    if (typeof userToken !== 'string') {
      response.status(403);
      response.send({ error: 'Forbidden' });
      return;
    }

    // On vérifie que le token est valide
    // console.log(userToken);
    const userId = await redisClient.getUserId(userToken);
    if (!userId) {
      response.status(401);
      response.send({ error: 'Unauthorized' });
      return;
    }

    // On récupère l'objet utilisateur
    // console.log('userId:', userId);
    const userObject = await dbClient.userById(userId);
    // console.log('userobject:', userObject);
    if (!userObject) {
      response.status(401);
      response.send({ error: 'Unauthorized' });
      return;
    }

    // On construit l'objet fichier
    const fileObject = {
      name: request.body.name, // filename
      type: request.body.type, // folder, file or image
      isPublic: request.body.isPublic || false, // True, False(default)
      parentId: request.body.parentId || 0, // O-> the root
      userId: userObject._id, // The user ID should be added to the document saved in DB - as owner of a file
    };


    // Checks sur les propriétés de l'objet fichier
    if (typeof fileObject.name !== 'string') {
      response.status(400);
      response.send({ error: 'Missing name' });
      return;
    }
    if (fileObject.type !== 'folder' && fileObject.type !== 'file' && fileObject.type !== 'image') {
      response.status(400);
      response.send({ error: 'Missing type' });
      return;
    }
    if (!request.body.data && fileObject.type !== 'folder') {
      response.status(400);
      response.send({ error: 'Missing data' });
      return;
    }

    // Check sur le parent (existe et est un dossier)
    if (fileObject.parentId) {
      const parentFile = await dbClient.fileWithID(fileObject.parentId);
      if (!parentFile) {
        response.status(400);
        response.send({ error: 'Parent not found' });
        return;
      }

      if (parentFile.type !== 'folder') {
        response.status(400);
        response.send({ error: 'Parent is not a folder' });
        return;
      }
    }

    // Si notre fileObject n'est pas un dossier
    // Donc image ou file
    if (fileObject.type !== 'folder') {
      // On définie le chemin d'enregistrement
      const fileDir = process.env.FOLDER_PATH || '/tmp/files_manager/';
      // console.log(`fileDir: ${fileDir}`);

      try {
        // Supprimer le répertoire s'il existe déjà
        if (fs.existsSync(fileDir)) {
          await fsPromises.rm(fileDir, { recursive: true });
        }
        await mkdir(fileDir);
      } catch (error) {
        // console.error('error mkdir:', error);
      }

      // On l'ajoute à notre objet "fileObject"
      fileObject.localPath = fileDir + uuidv4();

      // data contient le fichier en base64
      // On le converti en utf-8
      const fileContent = Buffer.from(request.body.data, 'base64')
        .toString('utf-8');
      // console.log(`fileContent: ${fileContent}`);

      // On écrit le fichier
      try {
        // writefile(chemin, contenu du fichier)
        await writeFile(fileObject.localPath, fileContent);
      } catch (error) {
        // console.error('error writefile:', error);
        response.status(500);
        response.send({ error: 'Failed to add file' });
        return;
      }
    }

    const insertResult = await dbClient.addFile(fileObject);

    if (!insertResult.result.ok) {
      response.status(500);
      response.send({ error: 'Failed to add file' });
      return;
    }

    if (fileObject.type === 'image') {
      fileQueue.add({ userId: fileObject.userId, fileId: fileObject._id });
    }

    fileObject.id = fileObject._id;
    delete fileObject._id;

    // console.log(fileObject);

    response.status(201);
    response.send(fileObject);
  }
}

module.exports = FilesController;
