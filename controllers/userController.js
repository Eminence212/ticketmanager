const { User, Customer } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createActivationToken,
  createRefreshToken,
  createAccessToken,
} = require("../utils/token");
const { Op } = require("sequelize");
require("dotenv").config();

const userController = {
  register: async (req, res) => {
    try {
      const { name, password, role = 0 } = req.body;
      if (!name)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le nom d'utilisateur." });
      if (!password)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le mot de passe." });

      const user = await User.findOne({
        where: {
          [Op.or]: [{ name: name.toLowerCase() }, { name: name.toUpperCase() }],
        },
      });
      if (user)
        return res
          .status(400)
          .json({ msg: "Ce nom d'utilisateur existe déjà." });

      if (password.length < 6)
        return res.status(400).json({
          msg: "Le mot de passe doit comporter au moins 6 caractères.",
        });
      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = {
        name: name.toUpperCase(),
        password: passwordHash,
        role,
      };

      const activation_token = createActivationToken(newUser);
      const url = `/user/activate/${activation_token}`;

      await User.create(newUser);
      res.json({
        msg: "Enregistrement réussi !",
        url: url,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  activateAccount: async (req, res) => {
    try {
      const { activation_token } = req.body;
      const user = jwt.verify(
        activation_token,
        process.env.ACTIVATION_TOKEN_SECRET
      );
      const { name, password } = user;

      const check = await User.findOne({
        where: {
          [Op.or]: [{ name: name.toLowerCase() }, { name: name.toUpperCase() }],
        },
      });
      if (check)
        return res
          .status(400)
          .json({ msg: "Ce nom d'utilisateur existe déjà." });
      const newUser = { name: name.toUpperCase(), password };
      await User.create(newUser);
      res.json({ msg: "Votre compte a été activé !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const { name, password } = req.body;

      const user = await User.findOne({
        where: {
          [Op.or]: [{ name: name.toLowerCase() }, { name: name.toUpperCase() }],
        },
      });

      if (!user)
        return res
          .status(400)
          .json({ msg: "Ce nom d'utilisateur n'existe pas." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Le mot de passe est incorrect." });

      const refresh_token = createRefreshToken({ id: user.id });

      res.json({ msg: "Connexion réussie !", refresh_token });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getAccessToken: (req, res) => {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token)
        return res
          .status(400)
          .json({ msg: "Veuillez vous connecter maintenant !" });
      jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err)
            return res
              .status(400)
              .json({ msg: "Veuillez vous connecter maintenant !" });
          const access_token = createAccessToken({ id: user.id });
          res.json({ access_token });
        }
      );
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { name } = req.body;
      const user = await User.findOne({
        where: {
          [Op.or]: [{ name: name.toLowerCase() }, { name: name.toUpperCase() }],
        },
      });
      if (!user)
        return res
          .status(400)
          .json({ msg: "Ce nom d'utilisateur n'existe pas." });
      const access_token = createAccessToken({ id: user.id });

      const url = `/user/reset/${access_token}/${user.id}`;

      res.json({
        url: url,
        access_token: access_token,
        id: user.id,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password, id } = req.body;
      const passwordHash = await bcrypt.hash(password, 12);
      await User.update({ password: passwordHash }, { where: { id: id } });
      res.json({ msg: "Le mot de passe a été changé avec succès !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getUserInfor: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ["id", "name", "role"],
        include: [{ model: Customer }],
      });
      res.json(user);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getUsersAllInfor: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ["id", "name", "role", "createdAt", "updatedAt"],
        include: [{ model: Customer }],
        order: [["name", "ASC"]],
      });

      res.json(users);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/api/v1/user/refresh_token" });
      return res.json({ msg: "Déconnecté." });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const id = req.params.id;
      const { name, role } = req.body;
      const userById = await User.findOne({ where: { id: id } });
      if (!userById) {
        return res.status(404).json({ msg: "Non trouvé" });
      }

      await User.update(
        {
          name: name.toUpperCase(),
          role: role,
        },
        { where: { id: id } }
      );
      res.json({ msg: "Mise à jour effectuée avec succès !!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  updateUsersRole: async (req, res) => {
    try {
      const { role } = req.body;
      await User.update({ role }, { where: { id: req.params.id } });
      res.json({
        msg: `L'utlisateur a été ${role < 0 ? "désactiver" : "activer"}`,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  updateUserProfile: async (req, res) => {
    try {
      const { name, password, role } = req.body;
      await User.update(
        { name: name.toLowerCase(), password, role },
        { where: { id: req.params.id } }
      );
      res.json({ msg: "Profile mise à jour !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      await User.destroy({ where: { id: req.params.id } });
      res.json({ msg: "Supprimé avec succès !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
module.exports = userController;
