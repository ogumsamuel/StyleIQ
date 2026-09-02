import { useEffect, useState } from 'react';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';

import { db } from '../firebase';
import { supabase } from '../supabase';

type Product = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  category: string;
  gender: 'Men' | 'Women' | 'Unisex';
  style: string[];
  color: string;
  description: string;
  image: string;
};

interface ProductsProps {
  onBack: () => void;
}

function Products({ onBack }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  // ==========================================
  // FORM STATE
  // ==========================================

  const [name, setName] = useState('');
  const [priceValue, setPriceValue] =
    useState('');

  const [category, setCategory] =
    useState('');

  const [gender, setGender] =
    useState<'Men' | 'Women' | 'Unisex'>(
      'Unisex'
    );

  const [stylesInput, setStylesInput] =
    useState('');

  const [color, setColor] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const snapshot = await getDocs(
        collection(db, 'products')
      );

      const loadedProducts: Product[] =
        snapshot.docs.map((productDoc) => ({
          id: productDoc.id,
          ...(productDoc.data() as Omit<Product, 'id'>),
        }));

      setProducts(loadedProducts);
    } catch (error) {
      console.error(
        'Error loading products:',
        error
      );

      setError(
        'Unable to load products. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setName('');
    setPriceValue('');
    setCategory('');
    setGender('Unisex');
    setStylesInput('');
    setColor('');
    setDescription('');
    setImageFile(null);
  };

  // ==========================================
  // ADD PRODUCT
  // ==========================================

  const handleAddProduct = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!name.trim()) {
      setError('Please enter a product name.');
      return;
    }

    if (!priceValue.trim()) {
      setError('Please enter a product price.');
      return;
    }

    const numericPrice =
      Number(priceValue);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice <= 0
    ) {
      setError(
        'Please enter a valid product price.'
      );
      return;
    }

    if (!category.trim()) {
      setError(
        'Please enter a product category.'
      );
      return;
    }

    if (!color.trim()) {
      setError(
        'Please enter a product color.'
      );
      return;
    }

    if (!description.trim()) {
      setError(
        'Please enter a product description.'
      );
      return;
    }

    if (!imageFile) {
      setError(
        'Please select a product image.'
      );
      return;
    }

    try {
      setSaving(true);

      // ==================================
      // CREATE UNIQUE IMAGE NAME
      // ==================================

      const fileExtension =
        imageFile.name
          .split('.')
          .pop() || 'jpg';

      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExtension}`;

      const filePath =
        `products/${fileName}`;

      // ==================================
      // UPLOAD IMAGE TO SUPABASE
      // ==================================

      const {
        error: uploadError,
      } = await supabase.storage
        .from('product-images')
        .upload(
          filePath,
          imageFile,
          {
            cacheControl: '3600',
            upsert: false,
          }
        );

      if (uploadError) {
        console.error(
          'Supabase upload error:',
          uploadError
        );

        throw new Error(
          'Unable to upload product image.'
        );
      }

      // ==================================
      // GET PUBLIC IMAGE URL
      // ==================================

      const {
        data: publicUrlData,
      } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const imageUrl =
        publicUrlData.publicUrl;

      // ==================================
      // CONVERT STYLES
      // ==================================

      const styles =
        stylesInput
          .split(',')
          .map((style) =>
            style.trim()
          )
          .filter(Boolean);

      // ==================================
      // SAVE PRODUCT TO FIRESTORE
      // ==================================

      const productData = {
        name: name.trim(),

        price: `$${numericPrice.toFixed(2)}`,

        priceValue: numericPrice,

        category:
          category.trim(),

        gender,

        style: styles,

        color:
          color.trim(),

        description:
          description.trim(),

        image: imageUrl,
      };

      await addDoc(
        collection(db, 'products'),
        productData
      );

      // ==================================
      // SUCCESS
      // ==================================

      resetForm();

      setShowAddForm(false);

      await loadProducts();

    } catch (error) {
      console.error(
        'Error adding product:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to add product.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDelete = async (
    productId: string
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this product?'
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          'products',
          productId
        )
      );

      setProducts(
        (currentProducts) =>
          currentProducts.filter(
            (product) =>
              product.id !==
              productId
          )
      );

    } catch (error) {
      console.error(
        'Error deleting product:',
        error
      );

      alert(
        'Unable to delete this product. Please try again.'
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>

          <div style={styles.loadingIcon}>
            ✨
          </div>

          <h2 style={styles.loadingTitle}>
            Loading Products
          </h2>

          <p style={styles.loadingText}>
            Getting products from Firestore...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <button
            onClick={onBack}
            style={styles.backButton}
          >
            ← Back
          </button>

          <h1 style={styles.title}>
            Products
          </h1>

          <p style={styles.subtitle}>
            Manage StyleIQ products
          </p>

        </div>

        <div style={styles.headerActions}>

          <button
            onClick={loadProducts}
            style={styles.refreshButton}
          >
            ↻ Refresh
          </button>

          <button
            onClick={() => {
              setError('');
              setShowAddForm(
                !showAddForm
              );
            }}
            style={styles.addButton}
          >
            + Add Product
          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div style={styles.errorBanner}>
          {error}
        </div>
      )}

      {/* ADD PRODUCT FORM */}

      {showAddForm && (
        <div style={styles.formCard}>

          <div style={styles.formHeader}>

            <div>
              <h2 style={styles.formTitle}>
                Add New Product
              </h2>

              <p style={styles.formSubtitle}>
                Add a product to your StyleIQ
                catalog.
              </p>
            </div>

            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
                setError('');
              }}
              style={styles.closeButton}
            >
              ✕
            </button>

          </div>

          <form
            onSubmit={handleAddProduct}
          >

            {/* NAME */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Product Name
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Classic Black Jacket"
                style={styles.input}
              />

            </div>

            {/* PRICE */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={priceValue}
                onChange={(e) =>
                  setPriceValue(
                    e.target.value
                  )
                }
                placeholder="89.99"
                style={styles.input}
              />

            </div>

            {/* CATEGORY */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Category
              </label>

              <input
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                placeholder="Jackets"
                style={styles.input}
              />

            </div>

            {/* GENDER */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Gender
              </label>

              <select
                value={gender}
                onChange={(e) =>
                  setGender(
                    e.target.value as
                      | 'Men'
                      | 'Women'
                      | 'Unisex'
                  )
                }
                style={styles.input}
              >

                <option value="Unisex">
                  Unisex
                </option>

                <option value="Men">
                  Men
                </option>

                <option value="Women">
                  Women
                </option>

              </select>

            </div>

            {/* STYLES */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Styles
              </label>

              <input
                value={stylesInput}
                onChange={(e) =>
                  setStylesInput(
                    e.target.value
                  )
                }
                placeholder="Classic, Casual, Smart Casual"
                style={styles.input}
              />

              <p style={styles.helperText}>
                Separate multiple styles with
                commas.
              </p>

            </div>

            {/* COLOR */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Color
              </label>

              <input
                value={color}
                onChange={(e) =>
                  setColor(
                    e.target.value
                  )
                }
                placeholder="Black"
                style={styles.input}
              />

            </div>

            {/* DESCRIPTION */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Describe the product..."
                rows={5}
                style={
                  styles.textarea
                }
              />

            </div>

            {/* IMAGE */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Product Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(
                    e.target.files?.[0] ||
                      null
                  )
                }
                style={styles.fileInput}
              />

              {imageFile && (
                <p
                  style={
                    styles.selectedFile
                  }
                >
                  Selected: {imageFile.name}
                </p>
              )}

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveButton,
                opacity:
                  saving ? 0.6 : 1,
              }}
            >
              {saving
                ? 'Saving Product...'
                : 'Save Product'}
            </button>

          </form>

        </div>
      )}

      {/* SUMMARY */}

      <div style={styles.summaryCard}>

        <div style={styles.summaryIcon}>
          🛍️
        </div>

        <div>

          <p style={styles.summaryLabel}>
            Total Products
          </p>

          <h2 style={styles.summaryNumber}>
            {products.length}
          </h2>

        </div>

      </div>

      {/* EMPTY STATE */}

      {products.length === 0 &&
        !showAddForm && (
          <div style={styles.emptyCard}>

            <div style={styles.emptyIcon}>
              🛍️
            </div>

            <h2 style={styles.emptyTitle}>
              No Products Yet
            </h2>

            <p style={styles.emptyText}>
              Your Firestore products
              collection is currently
              empty.
            </p>

            <p style={styles.emptyText}>
              Click
              <strong>
                {' + Add Product '}
              </strong>
              to add your first product.
            </p>

          </div>
        )}

      {/* PRODUCT GRID */}

      {products.length > 0 && (
        <div style={styles.grid}>

          {products.map(
            (product) => (
              <div
                key={product.id}
                style={
                  styles.productCard
                }
              >

                <div
                  style={
                    styles.imageContainer
                  }
                >

                  <img
                    src={product.image}
                    alt={product.name}
                    style={
                      styles.productImage
                    }
                  />

                </div>

                <div
                  style={
                    styles.productDetails
                  }
                >

                  <h3
                    style={
                      styles.productName
                    }
                  >
                    {product.name}
                  </h3>

                  <p
                    style={
                      styles.productPrice
                    }
                  >
                    {product.price}
                  </p>

                  <div
                    style={
                      styles.infoRow
                    }
                  >

                    <span
                      style={
                        styles.badge
                      }
                    >
                      {product.category}
                    </span>

                    <span
                      style={
                        styles.badge
                      }
                    >
                      {product.gender}
                    </span>

                  </div>

                  <p
                    style={
                      styles.productColor
                    }
                  >
                    Color:{' '}
                    <strong>
                      {product.color}
                    </strong>
                  </p>

                  <p
                    style={
                      styles.productDescription
                    }
                  >
                    {product.description}
                  </p>

                  <div
                    style={
                      styles.actions
                    }
                  >

                    <button
                      style={
                        styles.editButton
                      }
                      onClick={() => {
                        alert(
                          'Product editing will be added next.'
                        );
                      }}
                    >
                      Edit
                    </button>

                    <button
                      style={
                        styles.deleteButton
                      }
                      onClick={() =>
                        handleDelete(
                          product.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles: Record<
  string,
  React.CSSProperties
> = {

  page: {
    minHeight: '100vh',
    background: '#F7F5FC',
    padding: '30px 40px',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '25px',
    gap: '20px',
  },

  headerActions: {
    display: 'flex',
    gap: '10px',
  },

  backButton: {
    border: 'none',
    background: 'transparent',
    color: '#6C3CF0',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
    marginBottom: '12px',
    fontSize: '14px',
  },

  title: {
    margin: 0,
    color: '#111111',
    fontSize: '30px',
    fontWeight: 800,
  },

  subtitle: {
    marginTop: '6px',
    color: '#777777',
    fontSize: '14px',
  },

  refreshButton: {
    padding: '11px 18px',
    border: '1px solid #E5DFFF',
    borderRadius: '10px',
    background: '#FFFFFF',
    color: '#6C3CF0',
    fontWeight: 700,
    cursor: 'pointer',
  },

  addButton: {
    padding: '11px 18px',
    border: 'none',
    borderRadius: '10px',
    background: '#6C3CF0',
    color: '#FFFFFF',
    fontWeight: 700,
    cursor: 'pointer',
  },

  errorBanner: {
    background: '#FFECEC',
    color: '#D32F2F',
    borderRadius: '10px',
    padding: '12px 15px',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: 600,
  },

  formCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '28px',
    marginBottom: '25px',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '25px',
  },

  formTitle: {
    margin: 0,
    color: '#111111',
    fontSize: '22px',
  },

  formSubtitle: {
    color: '#777777',
    fontSize: '13px',
  },

  closeButton: {
    border: 'none',
    background: '#F5F5F5',
    width: '35px',
    height: '35px',
    borderRadius: '9px',
    cursor: 'pointer',
  },

  formGroup: {
    marginBottom: '18px',
  },

  label: {
    display: 'block',
    color: '#222222',
    fontWeight: 700,
    fontSize: '13px',
    marginBottom: '7px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px',
    border: '1px solid #E2E2E2',
    borderRadius: '9px',
    fontSize: '14px',
    outline: 'none',
  },

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px',
    border: '1px solid #E2E2E2',
    borderRadius: '9px',
    fontSize: '14px',
    resize: 'vertical',
    outline: 'none',
  },

  fileInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #E2E2E2',
    borderRadius: '9px',
    boxSizing: 'border-box',
  },

  selectedFile: {
    color: '#6C3CF0',
    fontSize: '12px',
    marginTop: '7px',
  },

  helperText: {
    color: '#888888',
    fontSize: '11px',
    marginTop: '6px',
  },

  saveButton: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '10px',
    background: '#6C3CF0',
    color: '#FFFFFF',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: '14px',
  },

  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '20px',
    marginBottom: '25px',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  summaryIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '14px',
    background: '#F0EBFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '25px',
  },

  summaryLabel: {
    margin: 0,
    color: '#777777',
    fontSize: '13px',
  },

  summaryNumber: {
    margin: '3px 0 0',
    color: '#111111',
    fontSize: '24px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },

  productCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  imageContainer: {
    width: '100%',
    height: '260px',
    background: '#F3F3F3',
  },

  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  productDetails: {
    padding: '20px',
  },

  productName: {
    margin: 0,
    color: '#111111',
    fontSize: '18px',
    fontWeight: 800,
  },

  productPrice: {
    margin: '7px 0 12px',
    color: '#6C3CF0',
    fontSize: '17px',
    fontWeight: 800,
  },

  infoRow: {
    display: 'flex',
    gap: '7px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },

  badge: {
    background: '#F0EBFF',
    color: '#6C3CF0',
    padding: '5px 8px',
    borderRadius: '7px',
    fontSize: '11px',
    fontWeight: 700,
  },

  productColor: {
    color: '#555555',
    fontSize: '13px',
  },

  productDescription: {
    color: '#777777',
    fontSize: '13px',
    lineHeight: 1.5,
    minHeight: '60px',
  },

  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '18px',
  },

  editButton: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '9px',
    background: '#F0EBFF',
    color: '#6C3CF0',
    fontWeight: 700,
    cursor: 'pointer',
  },

  deleteButton: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '9px',
    background: '#FFECEC',
    color: '#D32F2F',
    fontWeight: 700,
    cursor: 'pointer',
  },

  emptyCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '60px 30px',
    textAlign: 'center',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  emptyIcon: {
    fontSize: '45px',
    marginBottom: '15px',
  },

  emptyTitle: {
    margin: 0,
    color: '#111111',
  },

  emptyText: {
    color: '#777777',
    fontSize: '14px',
    lineHeight: 1.6,
  },

  loadingCard: {
    maxWidth: '450px',
    margin: '100px auto',
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '45px',
    textAlign: 'center',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  loadingIcon: {
    fontSize: '40px',
  },

  loadingTitle: {
    color: '#111111',
  },

  loadingText: {
    color: '#777777',
  },
};

export default Products;