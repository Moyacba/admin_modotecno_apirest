import * as catalogService from '../services/catalogService.js';
import * as recommendationService from '../services/recommendationService.js';
import { PrismaClient } from '../../prisma/db/index.js';
const prisma = new PrismaClient();

// ─── LECTURAS EXISTENTES ────────────────────────────────────────────────────

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

export const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await prisma.category.findUnique({
            where: { id: categoryId }
        });
        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        const subcategories = await prisma.subcategory.findMany({
            where: { categoryId },
            orderBy: { name: 'asc' }
        });
        res.json(subcategories);
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

// ─── CATEGORÍAS MACRO (CRUD) ────────────────────────────────────────────────

export const createCategory = async (req, res) => {
    try {
        const { name, key } = req.body;
        const category = await prisma.category.create({ data: { name, key } });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, key } = req.body;
        const category = await prisma.category.update({ where: { id }, data: { name, key } });
        res.json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const subs = await prisma.subcategory.count({ where: { categoryId: id } });
        if (subs > 0) {
            return res.status(409).json({ error: 'No se puede eliminar: tiene subcategorías asociadas.' });
        }
        await prisma.categoryAttribute.deleteMany({ where: { categoryId: id } });
        await prisma.category.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ─── SUBCATEGORÍAS (CRUD) ───────────────────────────────────────────────────

export const createSubcategory = async (req, res) => {
    try {
        const { name, key, categoryId, deviceCompatible } = req.body;
        const sub = await prisma.subcategory.create({
            data: { name, key, categoryId, deviceCompatible: deviceCompatible ?? false }
        });
        res.status(201).json(sub);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, key, categoryId, deviceCompatible } = req.body;
        const sub = await prisma.subcategory.update({
            where: { id },
            data: { name, key, categoryId, deviceCompatible }
        });
        res.json(sub);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.subcategoryAttribute.deleteMany({ where: { subcategoryId: id } });
        await prisma.subcategory.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ─── DEFINICIONES DE ATRIBUTO (CRUD) ────────────────────────────────────────

export const getAllAttributes = async (req, res) => {
    try {
        const attrs = await prisma.attributeDefinition.findMany({
            orderBy: { name: 'asc' },
            include: {
                categoryAttributes: { include: { category: true } },
                subcategoryAttributes: { include: { subcategory: true } }
            }
        });
        res.json(attrs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createAttribute = async (req, res) => {
    try {
        const { name, key, type, options = [] } = req.body;
        const attr = await prisma.attributeDefinition.create({ data: { name, key, type, options } });
        res.status(201).json(attr);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateAttribute = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, key, type, options } = req.body;
        const attr = await prisma.attributeDefinition.update({
            where: { id },
            data: { name, key, type, options }
        });
        res.json(attr);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteAttribute = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.categoryAttribute.deleteMany({ where: { attributeId: id } });
        await prisma.subcategoryAttribute.deleteMany({ where: { attributeId: id } });
        await prisma.attributeDefinition.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * PATCH /catalog/attributes/:id/options
 * body: { option: "Rojo", action: "add" | "remove" }
 */
export const patchAttributeOption = async (req, res) => {
    try {
        const { id } = req.params;
        const { option, action } = req.body;
        const attr = await prisma.attributeDefinition.findUnique({ where: { id } });
        if (!attr) return res.status(404).json({ error: 'Atributo no encontrado' });

        let newOptions;
        if (action === 'add') {
            if (attr.options.includes(option)) return res.status(409).json({ error: 'Opción ya existe' });
            newOptions = [...attr.options, option];
        } else if (action === 'remove') {
            newOptions = attr.options.filter(o => o !== option);
        } else {
            return res.status(400).json({ error: 'action debe ser "add" o "remove"' });
        }

        const updated = await prisma.attributeDefinition.update({
            where: { id },
            data: { options: newOptions }
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ─── MATRIZ DE COMPATIBILIDAD ────────────────────────────────────────────────

export const assignAttributeToCategory = async (req, res) => {
    try {
        const { id: categoryId } = req.params;
        const { attributeId, required = false, filterable = true, position = 0 } = req.body;
        const existing = await prisma.categoryAttribute.findFirst({
            where: { categoryId, attributeId }
        });
        if (existing) return res.status(409).json({ error: 'Ya está asignado' });
        const rel = await prisma.categoryAttribute.create({
            data: { categoryId, attributeId, required, filterable, position }
        });
        res.status(201).json(rel);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const unassignAttributeFromCategory = async (req, res) => {
    try {
        const { id: categoryId, attrId: attributeId } = req.params;
        await prisma.categoryAttribute.deleteMany({ where: { categoryId, attributeId } });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const assignAttributeToSubcategory = async (req, res) => {
    try {
        const { id: subcategoryId } = req.params;
        const { attributeId, required = false, filterable = true, position = 0 } = req.body;
        const existing = await prisma.subcategoryAttribute.findFirst({
            where: { subcategoryId, attributeId }
        });
        if (existing) return res.status(409).json({ error: 'Ya está asignado' });
        const rel = await prisma.subcategoryAttribute.create({
            data: { subcategoryId, attributeId, required, filterable, position }
        });
        res.status(201).json(rel);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const unassignAttributeFromSubcategory = async (req, res) => {
    try {
        const { id: subcategoryId, attrId: attributeId } = req.params;
        await prisma.subcategoryAttribute.deleteMany({ where: { subcategoryId, attributeId } });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
