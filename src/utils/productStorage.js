// نظام تخزين محسن للمنتجات
class ProductStorage {
  constructor() {
    this.productsKey = 'ecommerce_products';
    this.categoriesKey = 'ecommerce_categories';
    this.maxProducts = 100; // الحد الأقصى لعدد المنتجات
    this.backupKey = 'ecommerce_products_backup';
  }

  // دالة لجلب المنتجات
  getProducts() {
    try {
      const products = localStorage.getItem(this.productsKey);
      if (products) {
        return JSON.parse(products);
      }
      return [];
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
      // محاولة استرجاع من النسخة الاحتياطية
      return this.getBackupProducts();
    }
  }

  // دالة لحفظ المنتجات
  saveProducts(products) {
    try {
      // تحسين البيانات قبل الحفظ
      const optimizedProducts = products.map(product => ({
        id: product.id,
        title: product.title || '',
        price: parseFloat(product.price) || 0,
        quantity: parseInt(product.quantity) || 0,
        image: product.image || '',
        description: product.description || '',
        category: product.category || 'other',
        createdAt: product.createdAt || new Date().toISOString(),
        createdBy: product.createdBy || 'admin',
        isProtected: !!product.isProtected
      }));

      // تقييد عدد المنتجات لتجنب مشاكل الذاكرة
      const limitedProducts = optimizedProducts.slice(0, this.maxProducts);

      // حفظ البيانات
      const jsonData = JSON.stringify(limitedProducts);
      localStorage.setItem(this.productsKey, jsonData);

      // حفظ نسخة احتياطية
      this.saveBackup(limitedProducts);

      return true;
    } catch (error) {
      console.error('خطأ في حفظ المنتجات:', error);
      return false;
    }
  }

  // دالة لحفظ نسخة احتياطية
  saveBackup(products) {
    try {
      localStorage.setItem(this.backupKey, JSON.stringify(products));
    } catch (error) {
      console.error('خطأ في حفظ النسخة الاحتياطية:', error);
    }
  }

  // دالة لاسترجاع النسخة الاحتياطية
  getBackupProducts() {
    try {
      const backup = localStorage.getItem(this.backupKey);
      if (backup) {
        return JSON.parse(backup);
      }
    } catch (error) {
      console.error('خطأ في استرجاع النسخة الاحتياطية:', error);
    }
    return [];
  }

  // دالة لإضافة منتج جديد
  addProduct(newProduct) {
    try {
      const products = this.getProducts();
      const updatedProducts = [...products, newProduct];
      return this.saveProducts(updatedProducts);
    } catch (error) {
      console.error('خطأ في إضافة المنتج:', error);
      return false;
    }
  }

  // دالة لتحديث منتج
  updateProduct(productId, updatedProduct) {
    try {
      const products = this.getProducts();
      const updatedProducts = products.map(product => 
        product.id === productId ? { ...product, ...updatedProduct } : product
      );
      return this.saveProducts(updatedProducts);
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      return false;
    }
  }

  // دالة لحذف منتج
  deleteProduct(productId) {
    try {
      const products = this.getProducts();
      const updatedProducts = products.filter(product => product.id !== productId);
      return this.saveProducts(updatedProducts);
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error);
      return false;
    }
  }

  // دالة لجلب الفئات
  getCategories() {
    try {
      const categories = localStorage.getItem(this.categoriesKey);
      if (categories) {
        return JSON.parse(categories);
      }
      return ['electronics', 'clothing', 'books', 'home', 'sports', 'other'];
    } catch (error) {
      console.error('خطأ في جلب الفئات:', error);
      return ['electronics', 'clothing', 'books', 'home', 'sports', 'other'];
    }
  }

  // دالة لحفظ الفئات
  saveCategories(categories) {
    try {
      localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
      return true;
    } catch (error) {
      console.error('خطأ في حفظ الفئات:', error);
      return false;
    }
  }

  // دالة لتنظيف التخزين
  cleanup() {
    try {
      // التحقق من حجم التخزين وتنظيف إذا لزم الأمر
      const products = this.getProducts();
      if (products.length > this.maxProducts) {
        const limitedProducts = products.slice(-50); // الاحتفاظ بآخر 50 منتج فقط
        this.saveProducts(limitedProducts);
      }
      
      // تنظيف المفاتيح القديمة
      const oldKeys = [
        'ecommerce_products_old',
        'ecommerce_categories_old',
        'cartItems_old',
        'users_old'
      ];
      
      oldKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`فشل في إزالة ${key}:`, e);
        }
      });
      
      return true;
    } catch (error) {
      console.error('خطأ في تنظيف التخزين:', error);
      return false;
    }
  }

  // دالة للتحقق من سلامة البيانات
  validateData() {
    try {
      const products = this.getProducts();
      if (!Array.isArray(products)) {
        throw new Error('بيانات المنتجات غير صالحة');
      }

      // التحقق من كل منتج
      const validProducts = products.filter(product => {
        return product && 
               typeof product.id !== 'undefined' && 
               typeof product.title === 'string' && 
               !isNaN(parseFloat(product.price)) && 
               typeof product.quantity === 'number';
      });

      if (validProducts.length !== products.length) {
        // حفظ المنتجات الصالحة فقط
        this.saveProducts(validProducts);
        console.log(`تم تصحيح البيانات: ${products.length - validProducts.length} منتجات غير صالحة تمت إزالتها`);
      }

      return validProducts;
    } catch (error) {
      console.error('خطأ في التحقق من صحة البيانات:', error);
      return [];
    }
  }
}

// إنشاء نسخة واحدة من مخزن المنتجات
const productStorage = new ProductStorage();

export default productStorage;