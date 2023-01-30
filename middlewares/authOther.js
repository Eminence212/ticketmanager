const { User } = require("../models");

const authOther = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await User.findOne({ where: { id } });
    if (user.role === 1)
      return res.status(500).json({ msg: "Accès interdit aux ressources." });
    next();
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
module.exports = authOther;
