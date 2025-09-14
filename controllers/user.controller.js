const UserService = require('../services/user.service');

class UserController {
  static async loginUser(req, res) {
    try {
      const { email, mdp } = req.body;
      if (!email || !mdp)
        return res.status(400).json({ error: 'Email et mot de passe requis' });

      const { user, accessToken, refreshToken } =
        await UserService.authenticateUser(email, mdp);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Connexion réussie',
        user,
        accessToken,
      });
    } catch (error) {
      res
        .status(401)
        .json({ error: error.message || 'Email ou mot de passe incorrect' });
    }
  }

  static async refreshTokens(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!refreshToken)
        return res.status(401).json({ error: 'Refresh token manquant' });

      const { accessToken, refreshToken: newRefreshToken } =
        await UserService.refreshUserTokens(refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Tokens rafraîchis avec succès',
        accessToken,
      });
    } catch (error) {
      res.clearCookie('refreshToken');
      res.status(401).json({
        error: error.message || 'Impossible de rafraîchir les tokens',
      });
    }
  }

  static async logoutUser(req, res) {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Déconnexion réussie' });
  }

  static async createUser(req, res) {
    try {
      const result = await UserService.createUser(req.body);

      let message;
      if (result.isUpdate) {
        message = 'Utilisateur mis à jour avec succès';
      } else if (result.isTransformed) {
        message = 'Compte utilisateur créé à partir du producteur existant';
      } else {
        message = 'Utilisateur créé avec succès';
      }

      res.status(result.isNew ? 201 : 200).json({
        message,
        user: result.user,
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);

      if (error.message.includes('existe déjà')) {
        return res.status(409).json({ error: error.message });
      }
      console.error(error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const updatedUser = await UserService.updateUser(
        id,
        req.body,
        currentUser,
      );

      res.status(200).json({
        message: 'Utilisateur mis à jour avec succès',
        user: updatedUser.toJSON(),
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);

      if (error.message.includes('non trouvé')) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Erreur interne du serveur',
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      await UserService.deleteUser(id, currentUser);

      res.status(200).json({
        message:
          'Compte utilisateur supprimé avec succès (données producteur conservées)',
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);

      if (error.message.includes('non trouvé')) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Erreur interne du serveur',
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();

      res.status(200).json({
        users,
        total: users.length,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
      });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const user = await UserService.getUserById(id, currentUser);

      res.status(200).json({ user });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);

      if (error.message.includes('non trouvé')) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Erreur interne du serveur',
      });
    }
  }
}

module.exports = UserController;
