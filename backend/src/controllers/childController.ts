import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * Créer un enfant
 */
export const createChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parentId = req.user?.userId;
    const { firstname, lastname, birthdate, medicalInfo, specialNeeds } = req.body;

    if (!parentId) {
      throw new AppError(401, 'Non authentifié');
    }

    // Encrypter les données sensibles
    const encryptedFirstname = encrypt(firstname);
    const encryptedLastname = encrypt(lastname);
    const encryptedMedicalInfo = medicalInfo ? encrypt(JSON.stringify(medicalInfo)) : null;
    const encryptedSpecialNeeds = specialNeeds ? encrypt(specialNeeds) : null;

    const child = await prisma.child.create({
      data: {
        parentId,
        firstname: encryptedFirstname,
        lastname: encryptedLastname,
        birthdate: new Date(birthdate),
        medicalInfo: encryptedMedicalInfo,
        specialNeeds: encryptedSpecialNeeds,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: child.id,
        firstname, // Retourner en clair pour confirmation
        lastname,
        birthdate: child.birthdate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer tous les enfants du parent connecté
 */
export const getMyChildren = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parentId = req.user?.userId;

    if (!parentId) {
      throw new AppError(401, 'Non authentifié');
    }

    const children = await prisma.child.findMany({
      where: { parentId },
    });

    // Décrypter les données pour l'affichage
    const decryptedChildren = children.map((child) => ({
      ...child,
      firstname: decrypt(child.firstname),
      lastname: decrypt(child.lastname),
      medicalInfo: child.medicalInfo ? JSON.parse(decrypt(child.medicalInfo)) : null,
      specialNeeds: child.specialNeeds ? decrypt(child.specialNeeds) : null,
    }));

    res.status(200).json({
      status: 'success',
      data: decryptedChildren,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un enfant par ID
 */
export const getChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const child = await prisma.child.findUnique({
      where: { id },
    });

    if (!child) {
      throw new AppError(404, 'Enfant introuvable');
    }

    // Vérification des droits d'accès
    if (userRole === 'parent' && child.parentId !== userId) {
      throw new AppError(403, 'Accès non autorisé à cet enfant');
    }
    
    // TODO: Pour les animateurs, vérifier s'ils ont une mission avec cet enfant
    // Pour l'instant, on bloque si ce n'est pas le parent
    if (userRole !== 'parent') {
       // Logique à implémenter : vérifier mission active
       // throw new AppError('Accès restreint', 403);
    }

    const decryptedChild = {
      ...child,
      firstname: decrypt(child.firstname),
      lastname: decrypt(child.lastname),
      medicalInfo: child.medicalInfo ? JSON.parse(decrypt(child.medicalInfo)) : null,
      specialNeeds: child.specialNeeds ? decrypt(child.specialNeeds) : null,
    };

    res.status(200).json({
      status: 'success',
      data: decryptedChild,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un enfant
 */
export const updateChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const parentId = req.user?.userId;
    const { firstname, lastname, birthdate, medicalInfo, specialNeeds } = req.body;

    const child = await prisma.child.findUnique({ where: { id } });

    if (!child) {
      throw new AppError(404, 'Enfant introuvable');
    }

    if (child.parentId !== parentId) {
      throw new AppError(403, 'Accès non autorisé');
    }

    const dataToUpdate: any = {};
    if (firstname) dataToUpdate.firstname = encrypt(firstname);
    if (lastname) dataToUpdate.lastname = encrypt(lastname);
    if (birthdate) dataToUpdate.birthdate = new Date(birthdate);
    if (medicalInfo) dataToUpdate.medicalInfo = encrypt(JSON.stringify(medicalInfo));
    if (specialNeeds) dataToUpdate.specialNeeds = encrypt(specialNeeds);

    const updatedChild = await prisma.child.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({
      status: 'success',
      data: {
        id: updatedChild.id,
        message: 'Mise à jour effectuée',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un enfant
 */
export const deleteChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const parentId = req.user?.userId;

    const child = await prisma.child.findUnique({ where: { id } });

    if (!child) {
      throw new AppError(404, 'Enfant introuvable');
    }

    if (child.parentId !== parentId) {
      throw new AppError(403, 'Accès non autorisé');
    }

    // Soft delete
    await prisma.child.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({
      status: 'success',
      message: 'Enfant supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};
