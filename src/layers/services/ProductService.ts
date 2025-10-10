import { ProductRepository } from '../repositories/ProductRepostory';
import { ProductCreateInput, ProductUpdateInput, ProductFilterInput } from '@/types/ProductType';
import { NotFoundError } from '@/exceptions/NotFoundError';
import { ForbiddenError } from '@/exceptions/ForbidenError';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts(filter?: ProductFilterInput & { page?: number; limit?: number }) {
    const result = await this.productRepository.findAll(filter);
    
    return {
      products: result.products,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / (result.limit || 1)),
      },
    };
  }

  async getProductById(id: number) {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundError('Product');
    }

    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await this.productRepository.findBySlug(slug);
    
    if (!product) {
      throw new NotFoundError('Product');
    }

    return product;
  }

  async createProduct(data: ProductCreateInput) {
    // Check if slug already exists
    const existingProduct = await this.productRepository.findBySlug(data.slug);
    if (existingProduct) {
      throw new ForbiddenError('Product with this slug already exists');
    }

    return this.productRepository.create(data);
  }

  async updateProduct(id: number, data: ProductUpdateInput) {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError('Product');
    }

    // Check if new slug conflicts with another product
    if (data.slug && data.slug !== existingProduct.slug) {
      const slugExists = await this.productRepository.findBySlug(data.slug);
      if (slugExists) {
        throw new ForbiddenError('Product with this slug already exists');
      }
    }

    return this.productRepository.update(id, data);
  }

  async deleteProduct(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }

    await this.productRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }
}