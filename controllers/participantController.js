const { Place, Participation, Participant, Evenement } = require("../models");
const participantController = {
  register: async (req, res) => {
    try {
      const { name, telephone } = req.body;
      if (!name)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le nom du participant." });

      const participant = await Participant.findOne({
        where: { name },
      });
      if (participant)
        return res.status(400).json({
          msg: `Le participant : ${participant.name} existe déjà.`,
        });

      await Participant.create({ name, telephone });

      res.json({ msg: "Participant ajouté avec succès !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const participant = await Participant.findByPk(req.params.id, {
        include: {
          model: Participation,
          include: [Place, Evenement],
        },
      });
      if (participant) {
        res.json(participant);
      } else {
        return res.status(404).json({ msg: "Non trouvé" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const participant = await Participant.findAll({
        include: {
          model: Participation,
          include: [Place, Evenement],
        },
      });
      if (participant) {
        res.json(participant);
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
      const { name, telephone } = req.body;
      const participantById = await Participant.findOne({ where: { id: id } });
      if (!participantById) {
        return res.status(404).json({ msg: "Non trouvé" });
      }
      if (!name)
        return res
          .status(400)
          .json({ msg: "Veuillez saisir le nom du participant." });

      const participant = await Participant.findOne({ where: { name } });
      if (!participant)
        await Participant.update({ name, telephone }, { where: { id: id } });
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
          .json({ msg: "L'identifiant du participant est vide." });
      const participantById = await Participant.findOne({ where: { id: id } });
      if (!participantById) {
        return res.status(404).json({ msg: "Non trouvé" });
      }

      await Participant.destroy({ where: { id: id } });
      res.json({ msg: "Supprimé avec succès !" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
module.exports = participantController;
