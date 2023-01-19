const { User, Customer, sequelize } = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { criptString, decriptString } = require("../utils/criptograph");
const {
  createLocalDirectory,
  deleteLocalDirectory,
  updateLocalDirectory,
} = require("../utils/directory");
const ClientSftp = require("../utils/ClientSftp");

const userController = {
  register: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const {
        name,
        inbound,
        inbound_amp,
        outbound,
        outbound_amp,
        erreur,
        erreur_amp,
        archive,
        archive_amp,
        host,
        port,
        username,
        password,
        response_slug,
        userId,
      } = req.body;
      // Check  if the user name is already registered
      if (
        !name ||
        !inbound ||
        !inbound_amp ||
        !outbound ||
        !outbound_amp ||
        !erreur ||
        !erreur_amp ||
        !archive ||
        !archive_amp ||
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
            { inbound: inbound.toLowerCase() },
            { inbound: inbound.toUpperCase() },
          ],
        },
      });
      if (c_inbound)
        return res.status(400).json({ msg: `Lien ${inbound} déjà attribué` });
      const c_inbound_amp = await Customer.findOne({
        where: {
          [Op.or]: [
            { inbound_amp: inbound_amp.toLowerCase() },
            { inbound_amp: inbound_amp.toUpperCase() },
          ],
        },
      });
      if (c_inbound_amp)
        return res
          .status(400)
          .json({ msg: `Lien amplitude ${inbound_amp} déjà attribué` });
      const c_outbound = await Customer.findOne({
        where: {
          [Op.or]: [
            { outbound: outbound.toLowerCase() },
            { outbound: outbound.toUpperCase() },
          ],
        },
      });
      if (c_outbound)
        return res.status(400).json({ msg: `Lien ${outbound} déjà attribué` });
      const c_outbound_amp = await Customer.findOne({
        where: {
          [Op.or]: [
            { outbound_amp: outbound_amp.toLowerCase() },
            { outbound_amp: outbound_amp.toUpperCase() },
          ],
        },
      });
      if (c_outbound_amp)
        return res
          .status(400)
          .json({ msg: `Lien amplitude ${outbound_amp} déjà attribué` });
      const c_erreur = await Customer.findOne({
        where: {
          [Op.or]: [
            { erreur: erreur.toLowerCase() },
            { erreur: erreur.toUpperCase() },
          ],
        },
      });
      if (c_erreur)
        return res.status(400).json({ msg: `Lien ${erreur} déjà attribué` });
      const c_erreur_amp = await Customer.findOne({
        where: {
          [Op.or]: [
            { erreur_amp: erreur_amp.toLowerCase() },
            { erreur_amp: erreur_amp.toUpperCase() },
          ],
        },
      });
      if (c_erreur_amp)
        return res
          .status(400)
          .json({ msg: `Lien amplitude ${erreur_amp} déjà attribué` });
      const c_archive = await Customer.findOne({
        where: {
          [Op.or]: [
            { archive: archive.toLowerCase() },
            { archive: archive.toUpperCase() },
          ],
        },
      });
      if (c_archive)
        return res.status(400).json({ msg: `Lien ${archive} déjà attribué` });
      const c_archive_amp = await Customer.findOne({
        where: {
          [Op.or]: [
            { archive_amp: archive_amp.toLowerCase() },
            { archive_amp: archive_amp.toUpperCase() },
          ],
        },
      });
      if (c_archive_amp)
        return res
          .status(400)
          .json({ msg: `Lien amplitude ${archive_amp} déjà attribué` });

      if (!userId || userId <= 0)
        return res.status(400).json({ msg: "Utilisateur non autorisé." });

      let newCustomer = {
        name,
        inbound,
        inbound_amp,
        outbound,
        outbound_amp,
        erreur,
        erreur_amp,
        archive,
        archive_amp,
        host,
        port,
        username,
        password,
        response_slug,
        userId,
      };
      //Connexion au server SFTP
      const sftp = new ClientSftp(host, port, username, newCustomer.password);
      const { state, msg } = await sftp.connect();
      if (!state) {
        sftp.disconnect();
        return res.status(400).json({ msg });
      } else {
        //Véfifier si l'utilisateur existe déjà
        const c_user = await User.findOne(
          {
            where: {
              [Op.or]: [
                { name: username.toLowerCase() },
                { name: username.toUpperCase() },
              ],
            },
          },
          { transaction: t }
        );
        if (!c_user) {
          //Création de ses identifiants
          const user = await User.create(
            {
              name: username,
              password: await bcrypt.hash(password, 12),
            },
            { transaction: t }
          );
          newCustomer = { ...newCustomer, userId: user.id };
        } else {
          newCustomer = { ...newCustomer, userId: c_user.id };
        }
        //Création d'un client
        await Customer.create(newCustomer, { transaction: t });
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
    const newCustomers = [];
    try {
      const customer = await Customer.findByPk(req.params.id, {
        attributes: [
          "id",
          "name",
          "username",
          "inbound",
          "inbound_amp",
          "outbound",
          "outbound_amp",
          "erreur",
          "erreur_amp",
          "archive",
          "archive_amp",
          "host",
          "port",
          "password",
          "enable",
          "autovalidation",
          "response_slug",
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
          "inbound_amp",
          "outbound",
          "outbound_amp",
          "erreur",
          "erreur_amp",
          "archive",
          "archive_amp",
          "host",
          "port",
          "password",
          "enable",
          "autovalidation",
          "response_slug",
          "createdAt",
          "updatedAt",
        ],
        include: [{ model: User, attributes: ["id", "name", "role"] }],
        order: [["name", "ASC"]],
      });
      if (customers) {
        res.json(customers);
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
        inbound_amp,
        outbound,
        outbound_amp,
        erreur,
        erreur_amp,
        archive,
        archive_amp,
        host,
        port,
        password,
        enable,
        autovalidation,
        response_slug,
      } = req.body;
      const customer = await Customer.findOne({ where: { id } });
      if (!customer) {
        return res.status(404).json({ msg: "Non trouvée" });
      }
      if (
        !name ||
        !inbound ||
        !inbound_amp ||
        !outbound ||
        !outbound_amp ||
        !erreur ||
        !erreur_amp ||
        !archive ||
        !archive_amp ||
        !host ||
        !port ||
        !password
      )
        return res
          .status(400)
          .json({ msg: "Veuillez saisir toutes les informations." });
      if (
        customer.name !== name ||
        customer.inbound !== inbound ||
        customer.inbound_amp !== inbound ||
        customer.outbound !== outbound ||
        customer.outbound_amp !== outbound ||
        customer.erreur !== erreur ||
        customer.erreur_amp !== erreur ||
        customer.archive !== archive ||
        customer.archive_amp !== archive ||
        customer.host !== host ||
        customer.port !== port ||
        customer.password !== password ||
        customer.enable !== enable ||
        Customer.autovalidation !== autovalidation ||
        Customer.response_slug !== response_slug
      )
        await Customer.update(
          {
            name,
            inbound,
            inbound_amp,
            outbound,
            outbound_amp,
            erreur,
            erreur_amp,
            archive,
            archive_amp,
            host,
            port,
            password,
            enable,
            autovalidation,
            response_slug,
          },
          { where: { id } }
        );
      updateLocalDirectory(customer.name, name);
      res.json({ msg: "Mise à jour réussie !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  enable: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { enable } = req.body;
      const customer = await Customer.findOne({ where: { id } });
      if (!customer) {
        return res.status(404).json({ msg: "Non trouvée" });
      }

      await Customer.update(
        {
          enable: enable,
        },
        { where: { id } }
      );
      res.json({ msg: "Mise à jour réussie !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  validation: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { autovalidation } = req.body;
      const customer = await Customer.findOne({ where: { id } });
      if (!customer) {
        return res.status(404).json({ msg: "Non trouvée" });
      }

      await Customer.update(
        {
          autovalidation: autovalidation,
        },
        { where: { id } }
      );

      res.json({ msg: "Mise à jour réussie !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  delete: async (req, res) => {
    console.log({ req });
    const t = await sequelize.transaction();
    try {
      const id = parseInt(req.params.id);
      const username = req.params.username;

      if (!id || id <= 0)
        return res.status(400).json({ msg: "L'identifiant invalide." });
      const customer = await Customer.findOne({ where: { id } });
      if (!customer) {
        return res.status(404).json({ msg: "Client non trouvé" });
      }
      const user = await User.findOne({
        where: { name: username },
        include: [{ model: Customer }],
      });
      if (!user) {
        return res.status(404).json({ msg: "Utilisateur non trouvé" });
      }
      await Customer.destroy({
        where: { id: id },
        transaction: t,
      });
      if (user.Customers.length <= 1) {
        await User.destroy({
          where: { name: username },
          transaction: t,
        });
      }

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
