const { Place, Participation, Participant, Evenement } = require("../models");
const participationController = {
  register: async (req, res) => {
    try {
      const { participantId, evenementId, placeId, accompagner } = req.body;
      if (!participantId)
        return res
          .status(400)
          .json({ msg: "Veuillez choisir le nom du participant." });
      if (!evenementId)
        return res
          .status(400)
          .json({ msg: "Veuillez choisir le nom de l'événement." });
      if (!placeId)
        return res.status(400).json({ msg: "Veuillez choisir la place." });
      if (!accompagner)
        return res
          .status(400)
          .json({ msg: "Veuillez le nombre d'accompagnateur." });

      if (parseInt(accompagner) !== 1 || parseInt(accompagner) !== 2)
        return res
          .status(400)
          .json({ msg: "Le nombre d'accopagnateur doit être entre 1 ou 2" });
      const participantion = await Participation.findOne({
        where: { participantId, evenementId, placeId },
      });
      if (participantion)
        return res.status(400).json({
          msg: `La participantion  existe déjà.`,
        });
      const place = await Place.findOne({
        where: { placeId },
      });
      const nombrepart = await Participation.findAll({
        where: { evenementId, placeId },
      });

      if (place.capacite - nombrepart.length < 0) {
        await Participation.create({
          participantId,
          evenementId,
          placeId,
          accompagner,
        });
      } else {
        return res.status(400).json({
          msg: `Le nombre de place déjà suffisant pour cet événement`,
        });
      }

      res.json({ msg: "Participantion ajoutée avec succès !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const part = await Participation.findByPk(req.params.id, {
        include: [Participant, Place, Evenement],
      });
      if (part) {
        res.json(part);
      } else {
        return res.status(404).json({ msg: "Non trouvé" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const part = await Participation.findAll({
        include: [Participant, Place, Evenement],
      });
      if (part) {
        res.json(part);
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
      const { participantId, evenementId, placeId, accompagner } = req.body;
      const partById = await Participation.findOne({ where: { id: id } });
      if (!partById) {
        return res.status(404).json({ msg: "Non trouvée" });
      }
      if (!participantId)
        return res
          .status(400)
          .json({ msg: "Veuillez choisir le nom du participant." });
      if (!evenementId)
        return res
          .status(400)
          .json({ msg: "Veuillez choisir le nom de l'événement." });
      if (!placeId)
        return res.status(400).json({ msg: "Veuillez choisir la place." });
      if (!accompagner)
        return res
          .status(400)
          .json({ msg: "Veuillez le nombre d'accompagnateur." });

      if (parseInt(accompagner) !== 1 || parseInt(accompagner) !== 2)
        return res
          .status(400)
          .json({ msg: "Le nombre d'accopagnateur doit être entre 1 ou 2" });

      const place = await Place.findOne({
        where: { placeId },
      });
      const nombrepart = await Participation.findAll({
        where: { evenementId, placeId },
      });

      if (place.capacite - nombrepart.length <= 0) {
        const participantion = await Participation.findOne({
          where: { participantId, evenementId, placeId },
        });
        if (participantion) {
          await Participation.update(
            { participantId, evenementId, placeId, accompagner },
            { where: { id: id } }
          );
          res.json({ msg: "Mise à jour réussie !" });
        } else {
          return res.status(400).json({
            msg: `Non trouvée`,
          });
        }
      } else {
        return res.status(400).json({
          msg: `Le nombre de place déjà suffisant pour cet événement`,
        });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  check: async (req, res) => {
    try {
      const id = req.params.id;
      const { presence } = req.body;
      const partById = await Participation.findOne({ where: { id: id } });
      if (!partById) {
        return res.status(404).json({ msg: "Non trouvée" });
      }

      await Participation.update({ presence }, { where: { id: id } });
      res.json({ msg: "Mise à jour réussie !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ msg: "L'identifiant est vide." });
      const partById = await Participation.findOne({ where: { id: id } });
      if (!partById) {
        return res.status(404).json({ msg: "Non trouvé" });
      }

      await Participation.destroy({ where: { id: id } });
      res.json({ msg: "Supprimée avec succès !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
module.exports = participationController;
