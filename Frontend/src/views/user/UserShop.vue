<template>
  <div class="container">
    <div class="page-header">
      <h1>🛍️ Sản phẩm</h1>
    </div>

    <!-- Filter -->
    <div class="card" style="margin-bottom:16px;padding:14px 20px;display:flex;gap:12px;align-items:center">
      <input class="form-control" v-model="search"
        placeholder="Tìm sản phẩm…" style="max-width:280px" />
      <select class="form-control" v-model="filterCat" style="max-width:200px">
        <option value="">Tất cả danh mục</option>
        <option v-for="c in categories" :key="c.id" :value="c.name">
          {{ c.name }}
        </option>
      </select>
      <span style="margin-left:auto;font-size:13px;color:#9aa0a6">
        {{ filtered.length }} sản phẩm
      </span>
    </div>

    <!-- Product grid -->
    <div v-if="loading" class="loading-text">Đang tải…</div>
    <div v-else class="product-grid">
      <div v-for="p in filtered" :key="p.id" class="product-card">
        <div class="product-media">
          <img :src="primaryImage(p)" :alt="p.title" loading="lazy" />
          <div class="product-media-overlay"></div>
          <div class="product-media-chip">
            {{ p.brandName || p.categoryName || 'Đồ uống' }}
          </div>
        </div>
        <div class="product-body">
          <div class="product-tags">
            <span class="tag tag-cat">{{ p.categoryName || '—' }}</span>
            <span v-if="p.brandName" class="tag tag-brand">{{ p.brandName }}</span>
          </div>
          <div class="product-name">{{ p.title }}</div>
          <div class="product-desc">{{ p.description }}</div>
          <div class="product-info-row">
            <div class="product-price">{{ fmt(p.price) }}</div>
            <div class="product-stock">
              <span v-if="p.stock > 0" class="badge badge-ok">
                Còn {{ p.stock }} sản phẩm
              </span>
              <span v-else class="badge badge-danger">Hết hàng</span>
            </div>
          </div>
        </div>
        <div class="product-footer">
          <div style="display:flex;align-items:center;gap:8px">
            <button class="qty-btn" @click="changeQty(p.id, -1)">−</button>
            <span class="qty-val">{{ qty[p.id] || 1 }}</span>
            <button class="qty-btn" @click="changeQty(p.id, 1)">+</button>
          </div>
          <button class="btn-add"
            :disabled="p.stock === 0"
            @click="addToCart(p)">
            🛒 Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { categoryApi, productApi, cartApi, productImageApi } from '../../services/api.js'
import { idKey } from '../../utils/display.js'

const emit = defineEmits(['cart-updated'])

const products  = ref([])
const categories = ref([])
const productImages = ref([])
const loading   = ref(true)
const search    = ref('')
const filterCat = ref('')
const qty       = reactive({})
const toast     = ref('')

function normalizeProduct(p = {}) {
  const brand = p.brand && typeof p.brand === 'object' ? p.brand : null
  const category = p.category && typeof p.category === 'object' ? p.category : null
  const productId = idKey(p.id || p._id)
  const fallbackImages = imageMap.value.get(productId) || []
  const directImages = Array.isArray(p.images) ? p.images.filter(Boolean) : []
  return {
    id: p.id || p._id || '',
    title: p.title || p.name || '',
    description: p.description || '',
    price: Number(p.price || 0),
    stock: Number(p.stock ?? p.stockQuantity ?? 0),
    categoryName: category?.name || p.categoryName || '',
    brandName: brand?.name || p.brandName || '',
    images: directImages.length ? directImages : fallbackImages
  }
}

const imageMap = computed(() => {
  const map = new Map()
  productImages.value.forEach(item => {
    const product = item.product && typeof item.product === 'object' ? item.product : null
    const productId = idKey(product?._id || item.productId || item.product)
    if (!productId || !item.imageUrl) return
    const list = map.get(productId) || []
    list.push(item.imageUrl)
    map.set(productId, list)
  })
  return map
})

const backendOrigin = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')

function resolveImageUrl(url) {
  if (!url) return ''
  const value = String(url).trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (backendOrigin) {
    return `${backendOrigin}${value.startsWith('/') ? value : `/${value}`}`
  }
  return value.startsWith('/') ? value : `/${value}`
}

function isPlaceholderImage(url) {
  const value = String(url || '').trim()
  return !value || /^https?:\/\/(placehold\.co|placeimg\.com)\//i.test(value)
}

function pickBestImage(urls = []) {
  const list = Array.isArray(urls) ? urls.filter(Boolean) : []
  if (!list.length) return ''
  return list.find(url => !isPlaceholderImage(url)) || list[0]
}

function fallbackImage(title = 'Sản phẩm') {
  return `https://placehold.co/640x480/e2e8f0/64748b?text=${encodeURIComponent(title || 'Sản phẩm')}`
}

function primaryImage(p = {}) {
  const productId = idKey(p.id || p._id)
  const fallbackImages = imageMap.value.get(productId) || []
  const directImages = Array.isArray(p.images) ? p.images.filter(Boolean) : []
  const firstImage = pickBestImage([...directImages, ...fallbackImages])
  return resolveImageUrl(firstImage) || fallbackImage(p.title)
}

const filtered = computed(() =>
  products.value
    .filter(p => String(p.title || '').toLowerCase().includes(search.value.toLowerCase()))
    .filter(p => !filterCat.value || p.categoryName === filterCat.value)
)

function changeQty(id, delta) {
  qty[id] = Math.max(1, (qty[id] || 1) + delta)
}

async function addToCart(p) {
  try {
    await cartApi.add({ product: p.id, quantity: qty[p.id] || 1 })
    showToast(`Đã thêm ${p.title} vào giỏ hàng!`)
    emit('cart-updated')
    qty[p.id] = 1
  } catch (e) {
    showToast(e.response?.data?.message || 'Lỗi thêm vào giỏ.')
  }
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => toast.value = '', 2500)
}

const fmt = v => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

onMounted(async () => {
  try {
    const [productsRes, categoriesRes, imagesRes] = await Promise.all([
      productApi.getAll(),
      categoryApi.getAll(),
      productImageApi.getAll()
    ])
    categories.value = Array.isArray(categoriesRes.data) ? categoriesRes.data : []
    productImages.value = Array.isArray(imagesRes.data) ? imagesRes.data : []
    products.value = (Array.isArray(productsRes.data) ? productsRes.data : []).map(normalizeProduct)
  } catch (e) {
    console.error(e)
    console.warn('Không tải được danh mục:', e)
  } finally { loading.value = false }
})
</script>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
.product-card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid #e7edf5;
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  box-shadow: 0 12px 28px rgba(28, 56, 102, 0.06);
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(28, 56, 102, 0.12);
  border-color: #d9e5f4;
}
.product-media {
  position: relative;
  height: 190px;
  background: linear-gradient(135deg, #dbeafe 0%, #ecfeff 100%);
  overflow: hidden;
}
.product-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
  transform: scale(1.01);
}
.product-media-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(3,16,43,0.08) 100%),
    radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 35%);
  pointer-events: none;
}
.product-media-chip {
  position: absolute;
  left: 14px;
  top: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.82);
  color: #0f172a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .2px;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}
.product-body  {
  padding: 16px 16px 14px;
  flex: 1;
}
.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .2px;
}
.tag-cat {
  color: #0c63ce;
  background: rgba(26, 115, 232, 0.10);
}
.tag-brand {
  color: #175e55;
  background: rgba(20, 184, 166, 0.12);
}
.product-name  {
  font-size: 17px;
  line-height: 1.25;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}
.product-desc  {
  font-size: 13px;
  line-height: 1.45;
  color: #6b7280;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 38px;
}
.product-info-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.product-price {
  font-size: 20px;
  font-weight: 900;
  color: #1a73e8;
  letter-spacing: -.2px;
}
.product-stock { margin-bottom: 0; }
.product-footer {
  padding: 14px 16px 16px;
  border-top: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: linear-gradient(180deg, rgba(248,250,252,0.4), rgba(255,255,255,1));
}
.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid #d9e1ea;
  background: #fff;
  cursor: pointer; font-size: 16px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04);
}
.qty-btn:hover { background: #f7fbff; border-color: #bcd2ef; }
.qty-val { font-size: 14px; font-weight: 700; min-width: 24px; text-align: center; color: #0f172a; }
.btn-add {
  flex: 1;
  padding: 10px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1a73e8, #1557b0);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 10px 18px rgba(26, 115, 232, 0.24);
}
.btn-add:hover    { background: linear-gradient(135deg, #1557b0, #0f4c9d); }
.btn-add:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #1e2329; color: #fff; padding: 12px 24px;
  border-radius: 8px; font-size: 14px; z-index: 999;
  animation: fadeIn .2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
</style>
