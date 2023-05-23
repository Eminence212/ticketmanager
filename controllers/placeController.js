const { Place, Participation, Participant, Evenement } = require("../models");
const placeController = {
  register: async (req, res) => {
    try {
      const { name, capacite } = req.body;
      if (!name)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le nom de la place." });
      if (!capacite)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le nombre de place." });

      const place = await Place.findOne({
        where: { name },
      });
      if (place)
        return res.status(400).json({
          msg: `Le nom de la place : ${place.name} existe déjà.`,
        });

      await Place.create({ name, capacite });

      res.json({ msg: "Place ajoutée avec succès !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const place = await Place.findByPk(req.params.id, {
        include: {
          model: Participation,
          include: [Participant, Evenement],
        },
      });
      if (place) {
        res.json(place);
      } else {
        return res.status(404).json({ msg: "Non trouvée" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const place = await Place.findAll({
        include: {
          model: Participation,
          include: [Participant, Evenement],
        },
      });
      if (place) {
        res.json(place);
      } else {
        return res.status(404).json({ msg: "Non trouvée" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { name, capacite } = req.body;
      const placeById = await Place.findOne({ where: { id: id } });
      if (!placeById) {
        return res.status(404).json({ msg: "Non trouvée" });
      }
      if (!name)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le nom de la place." });
      if (!capacite)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le nombre de place." });

      const place = await Place.findOne({ where: { name } });
      if (place) await Place.update({ name, capacite }, { where: { id: id } });
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
          .json({ msg: "L'identifiant de la place est vide." });
      const placeById = await Place.findOne({ where: { id: id } });
      if (!placeById) {
        return res.status(404).json({ msg: "Non trouvée" });
      }

      await Place.destroy({ where: { id: id } });
      res.json({ msg: "Supprimée avec succès !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
module.exports = placeController;
