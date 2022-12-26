const { User, Customer, sequelize } = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { criptString } = require("../utils/criptograph");
const {
  createLocalDirectory,
  deleteLocalDirectory,
} = require("../utils/directory");
const ClientSftp = require("../utils/ClientSftp");

const userController = {
  register: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const {
        name,
        inbound,
        outbound,
        erreur,
        archive,
        host,
        port,
        username,
        password,
        userId,
      } = req.body;
      // Check  if the user name is already registered
      if (
        !name ||
        !inbound ||
        !outbound ||
        !erreur ||
        !archive ||
        !host ||
        !port ||
        !username ||
        !password
      )
        return res
          .status(400)
          .json({ msg: "Veuillez saisir toutes les informations." });

      const c_name = await Customer.findOne({
        where: {
          [Op.or]: [{ name: name.toLowerCase() }, { name: name.toUpperCase() }],
        },
      });
      if (c_name)
        return res.status(400).json({ msg: "Le nom du client existe déjà." });
      const c_inbound = await Customer.findOne({
        where: {
          [Op.or]: [
            { name: inbound.toLowerCase() },
            { name: inbound.toUpperCase() },
          ],
        },
      });
      if (c_inbound)
        return res.status(400).json({ msg: `Lien ${inbound} déjà attribué` });
      const c_outbound = await Customer.findOne({
        where: {
          [Op.or]: [
            { name: outbound.toLowerCase() },
            { name: outbound.toUpperCase() },
          ],
        },
      });
      if (c_outbound)
        return res.status(400).json({ msg: `Lien ${outbound} déjà attribué` });

      const c_erreur = await Customer.findOne({
        where: {
          [Op.or]: [
            { name: erreur.toLowerCase() },
            { name: erreur.toUpperCase() },
          ],
        },
      });
      if (c_erreur)
        return res.status(400).json({ msg: `Lien ${erreur} déjà attribué` });
      const c_archive = await Customer.findOne({
        where: {
          [Op.or]: [
            { name: archive.toLowerCase() },
            { name: archive.toUpperCase() },
          ],
        },
      });
      if (c_archive)
        return res.status(400).json({ msg: `Lien ${archive} déjà attribué` });
      const c_username = await Customer.findOne({
        where: {
          [Op.or]: [
            { name: username.toLowerCase() },
            { name: username.toUpperCase() },
          ],
        },
      });
      if (c_username)
        return res
          .status(400)
          .json({ msg: `Le nom d'utilisateur existe déjà.` });

      if (!userId || userId <= 0)
        return res.status(400).json({ msg: "Utilisateur non autorisé." });

      const newCustomer = {
        name,
        inbound,
        outbound,
        erreur,
        archive,
        host,
        port,
        username,
        password: criptString(password),
        userId,
      };
      //Connexion au server SFTP
      const sftp = new ClientSftp(host, port, username, newCustomer.password);
      const { state, msg } = await sftp.connect();
      if (!state) {
        sftp.disconnect();
        return res.status(400).json({ msg });
      } else {
        //Création d'un client
        await Customer.create(newCustomer, { transaction: t });
        //Création de ses identifiants
        await User.create(
          {
            name: username,
            password: await bcrypt.hash(password, 12),
          },
          { transaction: t }
        );
        //Création du repertoire locale
        createLocalDirectory(name, ["in", "out", "err", "arch"]);
        await t.commit();
      }
      res.json({
        msg: "Enregistrement réussi !",
      });
    } catch (error) {
      await t.rollback();

      return res.status(500).json({ msg: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const customer = await Customer.findByPk(req.params.id, {
        attributes: [
          "id",
          "name",
          "username",
          "inbound",
          "outbound",
          "erreur",
          "archive",
          "host",
          "port",
          "enable",
          "autovalidation",
          "createdAt",
          "updatedAt",
        ],
        include: [{ model: User, attributes: ["id", "name", "role"] }],
      });
      if (customer) {
        res.json(customer);
      } else {
        return res.status(404).json({ msg: "Non trouvé" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  search: async (req, res) => {
    try {
      const customer = await Customer.findAll({
        where: {
          name: {
            [Op.like]: `%${req.params.query}%`,
          },
        },
        include: [{ model: User, attributes: ["id", "name", "role"] }],
        paranoid: false,
      });
      if (customer) {
        res.json(customer);
      } else {
        return res.status(404).json({ msg: "Non trouvé" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const customers = await Customer.findAll({
        attributes: [
          "id",
          "name",
          "username",
          "inbound",
          "outbound",
          "erreur",
          "archive",
          "host",
          "port",
          "enable",
          "autovalidation",
          "createdAt",
          "updatedAt",
        ],
        include: [{ model: User, attributes: ["id", "name", "role"] }],
        order: [["name", "ASC"]],
      });
      if (customers) {
        res.json({ customers, user: req.user });
      } else {
        return res.status(404).json({ msg: "Non trouvé" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const {
        name,
        inbound,
        outbound,
        erreur,
        archive,
        host,
        port,
        enable,
        autovalidation,
      } = req.body;
      const customer = await Customer.findOne({ where: { id } });
      if (!customer) {
        return res.status(404).json({ msg: "Non trouvée" });
      }
      if (
        !name ||
        !inbound ||
        !outbound ||
        !erreur ||
        !archive ||
        !host ||
        !port
      )
        return res
          .status(400)
          .json({ msg: "Veuillez saisir toutes les informations." });
      if (
        customer.name !== name ||
        customer.inbound !== inbound ||
        customer.outbound !== outbound ||
        customer.erreur !== erreur ||
        customer.archive !== archive ||
        customer.host !== host ||
        customer.port !== port ||
        customer.enable !== enable ||
        Customer.autovalidation !== autovalidation
      )
        await Customer.update(
          {
            name,
            inbound,
            outbound,
            erreur,
            archive,
            host,
            port,
            enable,
            autovalidation,
          },
          { where: { id } }
        );
      res.json({ msg: "Mise à jour réussie !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  delete: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const id = parseInt(req.params.id);
      const username = req.body.username;

      if (!id || id <= 0)
        return res.status(400).json({ msg: "L'identifiant invalide." });
      const customer = await Customer.findOne({ where: { id } });
      if (!customer) {
        return res.status(404).json({ msg: "Client non trouvé" });
      }
      const user = await User.findOne({ where: { name: username } });
      if (!user) {
        return res.status(404).json({ msg: "Utilisateur non trouvé" });
      }
      await Customer.destroy({
        where: { id: id },
        transaction: t,
      });
      await User.destroy({
        where: { name: username },
        transaction: t,
      });
      deleteLocalDirectory(customer.name);
      await t.commit();
      res.json({ msg: "Supprimé avec succès !" });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ msg: error.message });
    }
  },
};
module.exports = userController;
