/**
 * Helper para agrupar ventas o productos por su categoría padre.
 * Útil para reportes de rentabilidad por rubro macro.
 */

interface SaleItem {
    id: string;
    product: {
        categoryId: string;
        categoryRel?: {
            id: string;
            name: string;
            parentId: string | null;
            parent?: {
                id: string;
                name: string;
            }
        }
    };
    amount: number;
    cost: number;
}

export const groupSalesByCategoryParent = (sales: SaleItem[]) => {
    const report: Record<string, { name: string, totalSales: number, totalCost: number, profit: number }> = {};

    sales.forEach(sale => {
        const category = sale.product.categoryRel;
        
        // Determinar el nombre y ID del Rubro Padre
        let parentId = 'sin-clasificar';
        let parentName = 'Sin Clasificar';

        if (category) {
            if (category.parentId && category.parent) {
                // Es una subcategoría, usamos los datos del padre
                parentId = category.parent.id;
                parentName = category.parent.name;
            } else {
                // Es una categoría macro (no tiene padre), se usa a sí misma para agrupar
                parentId = category.id;
                parentName = category.name;
            }
        }

        if (!report[parentId]) {
            report[parentId] = {
                name: parentName,
                totalSales: 0,
                totalCost: 0,
                profit: 0
            };
        }

        report[parentId].totalSales += sale.amount;
        report[parentId].totalCost += sale.cost;
        report[parentId].profit += (sale.amount - sale.cost);
    });

    return Object.values(report).sort((a, b) => b.profit - a.profit);
};
