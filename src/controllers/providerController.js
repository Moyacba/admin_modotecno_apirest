import * as providerService from '../services/providerService.js';

export const getAllProviders = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly === 'true';
        const providers = await providerService.getAllProviders({ activeOnly });
        res.json(providers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createProvider = async (req, res) => {
    try {
        const provider = await providerService.createProvider(req.body);
        res.status(201).json(provider);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateProvider = async (req, res) => {
    try {
        const provider = await providerService.updateProvider(req.params.id, req.body);
        res.json(provider);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteProvider = async (req, res) => {
    try {
        await providerService.deleteProvider(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const toggleProviderActive = async (req, res) => {
    try {
        const provider = await providerService.toggleProviderActive(req.params.id);
        res.json(provider);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
