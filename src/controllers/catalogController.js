import * as catalogService from '../services/catalogService.js';
import * as recommendationService from '../services/recommendationService.js';

export const getCategories = async (req, res) => {
    try {
        const tree = await catalogService.getCatalogTree();
        res.json(tree);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSubcategoryAttributes = async (req, res) => {
    try {
        const { id } = req.params;
        const attributes = await catalogService.getCategoryAttributes(id);
        res.json(attributes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProductRecommendations = async (req, res) => {
    try {
        const { id } = req.params;
        const recommendations = await recommendationService.getRecommendations(id);
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
