import equivalenceGroupService from '../services/equivalenceGroupService.js';

export const getAll = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const groups = await equivalenceGroupService.getAll(includeInactive);

    res.status(200).json({ groups, total: groups.length });
  } catch (error) {
    console.error('Error fetching equivalence groups:', error);
    res.status(500).json({ error: error.message || 'Error fetching equivalence groups' });
  }
};

export const getById = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await equivalenceGroupService.getById(id);

    if (!group) {
      return res.status(404).json({ error: 'Equivalence group not found' });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching equivalence group:', error);
    res.status(500).json({ error: error.message || 'Error fetching equivalence group' });
  }
};

export const create = async (req, res) => {
  try {
    const { name, description, minStock, productIds } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const created = await equivalenceGroupService.create({
      name,
      description,
      minStock,
      productIds,
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating equivalence group:', error);
    res.status(400).json({ error: error.message || 'Error creating equivalence group' });
  }
};

export const update = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await equivalenceGroupService.update(id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating equivalence group:', error);

    if (error.message === 'Equivalence group not found') {
      return res.status(404).json({ error: error.message });
    }

    res.status(400).json({ error: error.message || 'Error updating equivalence group' });
  }
};

export const remove = async (req, res) => {
  const { id } = req.params;

  try {
    await equivalenceGroupService.remove(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting equivalence group:', error);

    if (error.message === 'Equivalence group not found') {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || 'Error deleting equivalence group' });
  }
};
