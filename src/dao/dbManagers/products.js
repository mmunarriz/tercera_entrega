import productsModel from "../models/products.js"

export default class Products {
    constructor() {
    }

    getAll = async (limit = 10, page = 1, queryOptions = {}, sort = '') => {
        try {
            // Calcular el índice de inicio para paginación
            const startIndex = (page - 1) * limit;
            let productsQuery = productsModel.find(queryOptions);

            if (sort === 'asc') {
                productsQuery = productsQuery.sort({ price: 1 }); // Ordenar por precio ascendente
            } else if (sort === 'desc') {
                productsQuery = productsQuery.sort({ price: -1 }); // Ordenar por precio descendente
            }

            // Calcular información de paginación
            const products = await productsQuery.skip(startIndex).limit(limit).exec();
            const totalProducts = await productsModel.countDocuments(queryOptions);
            const totalPages = Math.ceil(totalProducts / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            return {
                products,
                totalPages,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                page,
                hasPrevPage,
                hasNextPage,
            };
        } catch (error) {
            throw error;
        }
    }

    getProductById = async (id) => {
        try {
            const product = await productsModel.findById(id);
            if (!product) return null; // Retornar null si el producto no se encuentra
            return product.toObject();
        } catch (error) {
            throw error; // Propagar cualquier error que ocurra al llamar a findById
        }
    }
    isProductCodeExist = async (code) => {
        const existingProduct = await productsModel.findOne({ code });
        return !!existingProduct; // Retornar True o False si se encontro un producto con el mismo code o no.
    }
    saveProduct = async (product) => {
        let result = await productsModel.create(product);
        return result;
    }
    updateProduct = async (id, product) => {
        let result = await productsModel.updateOne({ _id: id }, product)
        return result;
    }
    deleteProduct = async (id) => {
        const result = await productsModel.deleteOne({ _id: id });
        return result;
    }
}
