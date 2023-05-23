const { Evenement, Participation, Participant, Place } = require("../models");
const evenementController = {
  register: async (req, res) => {
    try {
      const { name, lieu, date } = req.body;
      if (!name)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le nom de l'événement." });
      if (!lieu)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le lieu de l'événement." });
      if (!date)
        return res
          .status(400)
          .json({ msg: "Veuillez choisir la date de l'événement." });

      const event = await Evenement.findOne({
        where: { name },
      });
      if (event)
        return res.status(400).json({
          msg: `Le nom de l'événement : ${event.name} existe déjà.`,
        });

      await Evenement.create({ name, lieu, date });

      res.json({ msg: "Evénement ajouté avec succès !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const event = await Evenement.findByPk(req.params.id, {
        include: {
          model: Participation,
          include: [Participant, Place],
        },
      });
      if (event) {
        res.json(event);
      } else {
        return res.status(404).json({ msg: "Non trouvé" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const event = await Evenement.findAll({
        include: {
          model: Participation,
          include: [Participant, Place],
        },
      });
      if (event) {
        res.json(event);
      } else {
        return res.status(404).json({ msg: "Non trouvé" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { name, lieu, date } = req.body;
      const eventById = await Evenement.findOne({ where: { id: id } });
      if (!eventById) {
        return res.status(404).json({ msg: "Non trouvé" });
      }
      if (!name)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le nom de l'événement." });
      if (!lieu)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le lieu de l'événement." });
      if (!date)
        return res
          .status(400)
          .json({ msg: "Veuillez choisir la date de l'événement." });

      const event = await Evenement.findOne({ where: { name } });
      if (!event)
        await Evenement.update({ name, lieu, date }, { where: { id: id } });
      res.json({ msg: "Mise à jour réussie !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id)
        return res
          .status(400)
          .json({ msg: "L'identifiant de l'événement est vide." });
      const eventById = await Evenement.findOne({ where: { id: id } });
      if (!eventById) {
        return res.status(404).json({ msg: "Non trouvé" });
      }

      await Evenement.destroy({ where: { id: id } });
      res.json({ msg: "Supprimé avec succès !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
module.exports = evenementController;
