const Certification = require('../models/Certification');

exports.getAllCertifications = async (req, res) => {
  try {
    const certifications = await Certification.find();
    res.status(200).json(certifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCertificationById = async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }
    res.status(200).json(certification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCertification = async (req, res) => {
  try {
    const certification = await Certification.create(req.body);
    res.status(201).json(certification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCertification = async (req, res) => {
  try {
    const certification = await Certification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }
    res.status(200).json(certification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCertification = async (req, res) => {
  try {
    const certification = await Certification.findByIdAndDelete(req.params.id);
    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }
    res.status(200).json({ message: 'Certification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
