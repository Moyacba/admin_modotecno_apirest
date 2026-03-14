import { PrismaClient } from 'db';
const prisma = new PrismaClient();

// Obtener todas las categorías (árbol jerárquico opcional o lista plana)
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        parent: true
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear categoría
const createCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        parentId: parentId || null
      }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        parentId: parentId || null
      }
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar categoría
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener árbol jerárquico
const getCategoryTree = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true
          }
        }
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getCategories,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory
};
