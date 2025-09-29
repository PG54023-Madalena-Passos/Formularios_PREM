import { Router, Request, Response } from "express";
import Settings from "../models/settings"; // importa o teu modelo Mongoose

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne({});
    if (!settings) {
      res.json({});
      return;
    }
    res.json(settings);
  } catch (err) {
    console.error("Erro ao buscar settings:", err);
    res.status(500).json({ error: "Erro ao buscar settings" });
  }
});


// 🔹 Atualizar ou criar settings
router.put("/", async (req, res) => {
  try {
    const newSettings = req.body;

    // atualiza ou cria se não existir
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: newSettings },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (err) {
    console.error("Erro ao atualizar settings:", err);
    res.status(500).json({ error: "Erro ao atualizar settings" });
  }
});

export default router;
