const Artisan = require('../models/artisanModel');

async function listArtisans(req, res) {
  try {
    const artisans = await Artisan.getAllArtisans();
    res.json(artisans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getArtisan(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const artisan = await Artisan.getArtisanById(id);
    if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
    res.json(artisan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createArtisan(req, res) {
  try {
    const { name, contact_info, craft_types, lead_time_days } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const newArtisan = await Artisan.createArtisan({ name, contact_info, craft_types, lead_time_days });
    res.status(201).json(newArtisan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateArtisan(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Artisan.getArtisanById(id);
    if (!existing) return res.status(404).json({ error: 'Artisan not found' });
    const { name, contact_info, craft_types, lead_time_days } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const updated = await Artisan.updateArtisan(id, { name, contact_info, craft_types, lead_time_days });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteArtisan(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Artisan.getArtisanById(id);
    if (!existing) return res.status(404).json({ error: 'Artisan not found' });
    const success = await Artisan.deleteArtisan(id);
    if (success) return res.json({ message: 'Deleted' });
    res.status(500).json({ error: 'Failed to delete' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listArtisans,
  getArtisan,
  createArtisan,
  updateArtisan,
  deleteArtisan
};
