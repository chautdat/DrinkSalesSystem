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
        <option value="Nước khoáng">Nước khoáng</option>
        <option value="Nước tinh khiết">Nước tinh khiết</option>
        <option value="Nước có gas">Nước có gas</option>
      </select>
      <span style="margin-left:auto;font-size:13px;color:#9aa0a6">
        {{ filtered.length }} sản phẩm
      </span>
    </div>

    <!-- Product grid -->
    <div v-if="loading" class="loading-text">Đang tải…</div>
    <div v-else class="product-grid">
      <div v-for="p in filtered" :key="p.id" class="product-card">
        <div class="product-img">💧</div>
        <div class="product-body">
          <div class="product-cat">{{ p.categoryName }}</div>
          <div class="product-name">{{ p.name }}</div>
          <div class="product-desc">{{ p.description }}</div>
          <div class="product-price">{{ fmt(p.price) }}</div>
          <div class="product-stock">
            <span v-if="p.stockQuantity > 0" class="badge badge-ok">
              Còn {{ p.stockQuantity }} sản phẩm
            </span>
            <span v-else class="badge badge-danger">Hết hàng</span>
          </div>
        </div>
        <div class="product-footer">
          <div style="display:flex;align-items:center;gap:8px">
            <button class="qty-btn" @click="changeQty(p.id, -1)">−</button>
            <span class="qty-val">{{ qty[p.id] || 1 }}</span>
            <button class="qty-btn" @click="changeQty(p.id, 1)">+</button>
          </div>
          <button class="btn-add"
            :disabled="p.stockQuantity === 0"
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
import { productApi, cartApi } from '../../services/api.js'

const products  = ref([])
const loading   = ref(true)
const search    = ref('')
const filterCat = ref('')
const qty       = reactive({})
const toast     = ref('')

const filtered = computed(() =>
  products.value
    .filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))
    .filter(p => !filterCat.value || p.categoryName === filterCat.value)
)

function changeQty(id, delta) {
  qty[id] = Math.max(1, (qty[id] || 1) + delta)
}

async function addToCart(p) {
  try {
    await cartApi.add({ productId: p.id, quantity: qty[p.id] || 1 })
    showToast(`Đã thêm ${p.name} vào giỏ hàng!`)
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
  try { const { data } = await productApi.getAll(); products.value = data }
  finally { loading.value = false }
})
</script>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.product-card {
  background: #fff; border: 1px solid #e8eaed;
  border-radius: 12px; overflow: hidden;
  display: flex; flex-direction: column;
  transition: box-shadow .2s;
}
.product-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.product-img {
  background: #e8f0fe; height: 120px;
  display: flex; align-items: center; justify-content: center;
  font-size: 48px;
}
.product-body  { padding: 14px; flex: 1; }
.product-cat   { font-size: 11px; color: #1a73e8; font-weight: 600; margin-bottom: 4px; }
.product-name  { font-size: 15px; font-weight: 600; color: #1e2329; margin-bottom: 4px; }
.product-desc  { font-size: 12.5px; color: #9aa0a6; margin-bottom: 8px; }
.product-price { font-size: 18px; font-weight: 700; color: #1a73e8; margin-bottom: 6px; }
.product-stock { margin-bottom: 4px; }
.product-footer {
  padding: 12px 14px; border-top: 1px solid #f0f2f5;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.qty-btn {
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid #dadce0; background: #fff;
  cursor: pointer; font-size: 16px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.qty-btn:hover { background: #f1f3f4; }
.qty-val { font-size: 14px; font-weight: 600; min-width: 24px; text-align: center; }
.btn-add {
  flex: 1; padding: 8px; border-radius: 7px;
  background: #1a73e8; color: #fff; border: none;
  cursor: pointer; font-size: 13px; font-weight: 500;
}
.btn-add:hover    { background: #1557b0; }
.btn-add:disabled { background: #dadce0; cursor: not-allowed; }
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #1e2329; color: #fff; padding: 12px 24px;
  border-radius: 8px; font-size: 14px; z-index: 999;
  animation: fadeIn .2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
</style>