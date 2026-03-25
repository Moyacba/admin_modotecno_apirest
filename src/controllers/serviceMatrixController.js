import { PrismaClient } from "db";

const prisma = new PrismaClient();

// ServiceDefect CRUD
export const getDefects = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = categoryId ? { categoryId } : {};
    const defects = await prisma.serviceDefect.findMany({
      where,
      orderBy: { name: "asc" },
    });
    res.json(defects);
  } catch (error) {
    res.status(500).json({ error: "Error fetching defects" });
  }
};

export const createDefect = async (req, res) => {
  const { name, categoryId } = req.body;
  if (!name || !categoryId) {
    return res.status(400).json({ error: "Name and Category ID are required" });
  }
  try {
    const defect = await prisma.serviceDefect.upsert({
      where: {
        name_categoryId: {
          name: name.trim().toUpperCase(),
          categoryId,
        },
      },
      update: {},
      create: {
        name: name.trim().toUpperCase(),
        categoryId,
      },
    });
    res.status(201).json(defect);
  } catch (error) {
    res.status(500).json({ error: "Error creating defect" });
  }
};

export const updateDefect = async (req, res) => {
  const { id } = req.params;
  const { name, categoryId } = req.body;
  try {
    const defect = await prisma.serviceDefect.update({
      where: { id },
      data: {
        name: name?.trim().toUpperCase(),
        categoryId,
      },
    });
    res.json(defect);
  } catch (error) {
    res.status(500).json({ error: "Error updating defect" });
  }
};

export const deleteDefect = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.serviceDefect.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting defect" });
  }
};

// ServiceAttribute CRUD
export const getAttributes = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = categoryId ? { categoryId, isActive: true } : { isActive: true };
    const attributes = await prisma.serviceAttribute.findMany({
      where,
      orderBy: { label: "asc" },
    });
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ error: "Error fetching attributes" });
  }
};

export const createAttribute = async (req, res) => {
  const { label, type, categoryId } = req.body;
  if (!label || !categoryId) {
    return res.status(400).json({ error: "Label and Category ID are required" });
  }
  try {
    const attribute = await prisma.serviceAttribute.upsert({
      where: {
        label_categoryId: {
          label: label.trim(),
          categoryId,
        },
      },
      update: { type, isActive: true },
      create: {
        label: label.trim(),
        type: type || "CHECKBOX",
        categoryId,
      },
    });
    res.status(201).json(attribute);
  } catch (error) {
    res.status(500).json({ error: "Error creating attribute" });
  }
};

export const updateAttribute = async (req, res) => {
  const { id } = req.params;
  const { label, type, categoryId, isActive } = req.body;
  try {
    const attribute = await prisma.serviceAttribute.update({
      where: { id },
      data: {
        label,
        type,
        categoryId,
        isActive,
      },
    });
    res.json(attribute);
  } catch (error) {
    res.status(500).json({ error: "Error updating attribute" });
  }
};

export const deleteAttribute = async (req, res) => {
  const { id } = req.params;
  try {
    // Soft delete by default or hard delete? User didn't specify.
    // Given the isActive field, let's allow hard delete but suggest soft delete.
    await prisma.serviceAttribute.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting attribute" });
  }
};
