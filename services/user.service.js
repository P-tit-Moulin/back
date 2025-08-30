const Producer = require('../entity/producer.entity');
const PasswordService = require('./password.services');
const JWTService = require('./jwt.services');

class UserService {
  static async generateNewProducerId() {
    const lastProducer = await Producer.findOne().sort({ id: -1 }).limit(1);
    return lastProducer ? String(parseInt(lastProducer.id) + 1) : '1';
  }

  static async createUser(userData) {
    const { prenom, nom_de_famille, email, mdp, role, ...producerData } =
      userData;

    const existingUser = await Producer.findOne({
      email,
      isUserAccount: true,
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await PasswordService.hashPassword(mdp);

    const existingProducerByName = await Producer.findOne({
      nom_de_famille,
      isUserAccount: true,
    });

    if (existingProducerByName) {
      existingProducerByName.prenom = prenom;
      existingProducerByName.email = email;
      existingProducerByName.mdp = hashedPassword;
      existingProducerByName.role = role || 'user';
      existingProducerByName.isUserAccount = true;

      Object.assign(existingProducerByName, producerData);

      await existingProducerByName.save();
      return { user: existingProducerByName, isUpdate: true };
    }

    const existingProducer = await Producer.findOne({
      nom: nom_de_famille,
      isUserAccount: { $ne: true },
    });

    if (existingProducer) {
      existingProducer.prenom = prenom;
      existingProducer.nom_de_famille = nom_de_famille;
      existingProducer.email = email;
      existingProducer.mdp = hashedPassword;
      existingProducer.role = role || 'user';
      existingProducer.isUserAccount = true;

      Object.assign(existingProducer, producerData);

      await existingProducer.save();
      return { user: existingProducer, isTransformed: true };
    }

    const newId = await this.generateNewProducerId();

    const coordinates = producerData.coordinates || [0, 0];

    const newProducer = new Producer({
      id: newId,
      geometry: {
        type: 'Point',
        coordinates,
      },
      nom: nom_de_famille,
      prenom,
      nom_de_famille,
      email,
      mdp: hashedPassword,
      role: role || 'user',
      isUserAccount: true,
      ...producerData,
    });

    await newProducer.save();
    return { user: newProducer, isNew: true };
  }

  static async updateUser(userId, updateData, currentUser) {
    const userToUpdate = await Producer.findOne({
      $or: [{ _id: userId }, { id: userId }],
      isUserAccount: true,
    });

    if (!userToUpdate) {
      throw new Error('Utilisateur non trouvé');
    }

    if (
      currentUser.role !== 'admin' &&
      currentUser._id.toString() !== userToUpdate._id.toString()
    ) {
      throw new Error(
        'Accès refusé. Seuls les administrateurs ou le propriétaire du compte peuvent effectuer cette action.',
      );
    }

    if (updateData.email && updateData.email !== userToUpdate.email) {
      const existingUser = await Producer.findOne({
        email: updateData.email,
        isUserAccount: true,
      });
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
    }

    if (updateData.role && currentUser.role !== 'admin') {
      delete updateData.role;
    }

    if (updateData.mdp) {
      updateData.mdp = await PasswordService.hashPassword(updateData.mdp);
    }

    if (updateData.nom_de_famille) {
      updateData.nom = updateData.nom_de_famille;
    }

    if (updateData.coordinates) {
      updateData.geometry = {
        type: 'Point',
        coordinates: updateData.coordinates,
      };
      delete updateData.coordinates;
    }

    Object.assign(userToUpdate, updateData);
    await userToUpdate.save();

    return userToUpdate;
  }

  static async deleteUser(userId, currentUser) {
    const userToDelete = await Producer.findOne({
      $or: [{ _id: userId }, { id: userId }],
      isUserAccount: true,
    });

    if (!userToDelete) {
      throw new Error('Utilisateur non trouvé');
    }

    if (
      currentUser.role !== 'admin' &&
      currentUser._id.toString() !== userToDelete._id.toString()
    ) {
      throw new Error(
        'Accès refusé. Seuls les administrateurs ou le propriétaire du compte peuvent effectuer cette action.',
      );
    }

    if (userToDelete.role === 'admin') {
      const adminCount = await Producer.countDocuments({
        role: 'admin',
        isUserAccount: true,
      });
      if (adminCount <= 1) {
        throw new Error('Impossible de supprimer le dernier administrateur');
      }
    }

    userToDelete.prenom = undefined;
    userToDelete.nom_de_famille = undefined;
    userToDelete.email = undefined;
    userToDelete.mdp = undefined;
    userToDelete.role = undefined;
    userToDelete.isUserAccount = false;

    await userToDelete.save();
    return true;
  }

  static async getAllUsers() {
    return Producer.find({ isUserAccount: true }).select('-mdp');
  }

  static async getUserById(userId, currentUser) {
    const user = await Producer.findOne({
      $or: [{ _id: userId }, { id: userId }],
      isUserAccount: true,
    }).select('-mdp');

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (
      currentUser.role !== 'admin' &&
      currentUser._id.toString() !== user._id.toString()
    ) {
      throw new Error('Accès refusé.');
    }

    return user;
  }

  static async authenticateUser(email, password) {
    const user = await Producer.findOne({ email, isUserAccount: true });
    if (!user) throw new Error('Email ou mot de passe incorrect');
    const isPasswordValid = await PasswordService.comparePassword(
      password,
      user.mdp,
    );
    if (!isPasswordValid) throw new Error('Email ou mot de passe incorrect');

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = JWTService.generateAccessToken(payload);
    const refreshToken = JWTService.generateRefreshToken({
      userId: user._id.toString(),
    });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  static async refreshUserTokens(refreshToken) {
    if (!refreshToken) throw new Error('Refresh token requis');
    const decoded = JWTService.verifyRefreshToken(refreshToken);

    const user = await Producer.findOne({
      _id: decoded.userId,
      isUserAccount: true,
    });
    if (!user) throw new Error('Utilisateur non trouvé');

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = JWTService.generateAccessToken(payload);
    const newRefreshToken = JWTService.generateRefreshToken({
      userId: user._id.toString(),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}

module.exports = UserService;
