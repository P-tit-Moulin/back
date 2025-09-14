const Producer = require('../entity/producer.entity');
const Password = require('../utils/password');
const JWTService = require('../utils/jwt');

class UserService {
  static async createUser(userData) {
    const { prenom, nom_de_famille, email, mdp, entreprise, ...producerData } =
      userData;

    const existingUserByEmail = await Producer.findOne({ email });
    if (existingUserByEmail) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const existingProducerByName = await Producer.findOne({
      nom: { $regex: `^${entreprise}$`, $options: 'i' },
    });

    const hashedPassword = await Password.hashPassword(mdp);
    let user, statusType;

    if (existingProducerByName) {
      existingProducerByName.prenom = prenom;
      existingProducerByName.nom = entreprise;
      existingProducerByName.nom_de_famille = nom_de_famille;
      existingProducerByName.email = email;
      existingProducerByName.mdp = hashedPassword;
      existingProducerByName.role = 'user';
      Object.assign(existingProducerByName, producerData);

      await existingProducerByName.save();
      user = existingProducerByName;
      statusType = 'isUpdate';
    } else {
      const coordinates = producerData.coordinates || [0, 0];

      const newProducer = new Producer({
        geometry: {
          type: 'Point',
          coordinates,
        },
        prenom,
        nom: entreprise,
        nom_de_famille,
        email,
        mdp: hashedPassword,
        role: 'user',
        ...producerData,
      });

      await newProducer.save();
      user = newProducer;
      statusType = 'isNew';
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj.id = user._id.toString();

    if (userObj.mdp) delete userObj.mdp;

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
      user: userObj,
      accessToken,
      refreshToken,
      [statusType]: true,
    };
  }

  static async updateUser(userId, updateData, currentUser) {
    const userToUpdate = await Producer.findOne({
      $or: [{ _id: userId }, { id: userId }],
    });

    if (!userToUpdate) {
      throw new Error('Utilisateur non trouvé');
    }

    if (updateData.email && updateData.email !== userToUpdate.email) {
      const existingUser = await Producer.findOne({
        email: updateData.email,
      });
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
    }

    if (updateData.role && currentUser.role !== 'admin') {
      delete updateData.role;
    }

    if (updateData.mdp) {
      updateData.mdp = await Password.hashPassword(updateData.mdp);
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

  static async deleteUser(userId) {
    const userToDelete = await Producer.findOne({
      $or: [{ _id: userId }, { id: userId }],
    });

    if (!userToDelete) {
      throw new Error('Utilisateur non trouvé');
    }

    if (userToDelete.role === 'admin') {
      const adminCount = await Producer.countDocuments({
        role: 'admin',
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

    await userToDelete.save();
    return true;
  }

  static async getAllUsers() {
    return Producer.find().select('-mdp');
  }

  static async getUserById(userId) {
    const user = await Producer.findOne({
      $or: [{ _id: userId }, { id: userId }],
    }).select('-mdp');

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }

  static async authenticateUser(email, password) {
    const user = await Producer.findOne({ email });
    const isPasswordValid = await Password.comparePassword(password, user.mdp);
    if (!user || !isPasswordValid)
      throw new Error('Email ou mot de passe incorrect');

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
