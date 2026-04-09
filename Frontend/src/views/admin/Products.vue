<template>
  <div class="container">
    <div class="page-header">
      <h1>Sản phẩm</h1>
      <button v-if="isAdmin" class="btn btn-primary" @click="openCreate">
        + Thêm sản phẩm
      </button>
    </div>

    <div class="card" style="margin-bottom:16px;padding:14px 20px;display:flex;gap:12px;align-items:center">
      <input class="form-control" v-model="search" placeholder="Tìm tên sản phẩm…" style="max-width:300px" />
      <span style="margin-left:auto;font-size:13px;color:#9aa0a6">
        {{ filtered.length }} sản phẩm
      </span>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-text">Đang tải…</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th>Tên sản phẩm</th>
              <th>Thương hiệu</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th v-if="isAdmin" style="width:160px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td style="color:#9aa0a6">#{{ p.id }}</td>
              <td style="font-weight:500">{{ p.name }}</td>
              <td>{{ p.brandName || '—' }}</td>
              <td style="font-weight:500;color:#1a73e8">{{ fmt(p.price) }}</td>
              <td :class="{ 'low-stock': p.stockQuantity <= 20 }">
                {{ p.stockQuantity }}
                <span v-if="p.stockQuantity <= 20 && p.stockQuantity > 0" class="badge badge-warning" style="margin-left:8px">Sắp hết</span>
                <span v-if="p.stockQuantity === 0" class="badge badge-danger" style="margin-left:8px">Hết hàng</span>
              </td>
              <td v-if="isAdmin">
                <button class="btn btn-secondary btn-sm" style="margin-right:6px" @click="openEdit(p)">Sửa</button>
                <button class="btn btn-danger btn-sm" @click="handleDelete(p.id)">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-title">{{ editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới' }}</div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Tên sản phẩm *</label>
            <input class="form-control" v-model="form.name" required />
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Giá bán (VNĐ) *</label>
              <input class="form-control" v-model.number="form.price" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label>Tồn kho *</label>
              <input class="form-control" v-model.number="form.stock" type="number" min="0" required />
            </div>
          </div>
          <div class="form-group">
            <label>Thương hiệu *</label>
            <select class="form-control" v-model="form.brandId" required>
              <option value="">-- Chọn --</option>
              <option v-for="b in brands" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Danh mục *</label>
            <select class="form-control" v-model.number="form.categoryId" required>
              <option value="">-- Chọn --</option>
              <option :value="1">Nước khoáng</option>
              <option :value="2">Nước tinh khiết</option>
              <option :value="3">Nước có gas</option>
            </select>
          </div>

          <div class="form-group">
            <label>Ảnh sản phẩm</label>
            <input class="form-control" type="file" accept="image/*" @change="onImageChange" />
            <small style="display:block;margin-top:6px;color:#9aa0a6;font-size:12px">
              Chọn ảnh ở đây, hệ thống sẽ upload sau khi lưu sản phẩm.
            </small>
            <div v-if="form.imageName" style="margin-top:8px;font-size:12px;color:#1a73e8">
              Đã chọn: <strong>{{ form.imageName }}</strong>
            </div>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="form.imagePrimary" />
              Ảnh chính
            </label>
          </div>

          <div v-if="formError" class="alert alert-error">{{ formError }}</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Đang lưu…' : (editingId ? 'Cập nhật' : 'Thêm mới') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { productApi, productImageApi, brandApi } from '../../services/api.js'

const products   = ref([])
const brands     = ref([])
const loading    = ref(true)
const search     = ref('')
const showModal  = ref(false)
const editingId  = ref(null)
const submitting = ref(false)
const formError  = ref('')

const user    = JSON.parse(sessionStorage.getItem('user') || '{}')
const isAdmin = computed(() => (user.role || '').toLowerCase() === 'admin')

const blank = () => ({
  name: '',
  price: 0,
  stock: 0,
  brandId: '',
  categoryId: '',
  imageFile: null,
  imageName: '',
  imagePrimary: true
})
const form  = ref(blank())

const filtered = computed(() =>
  products.value.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

async function load() {
  loading.value = true
  try {
    const [productsRes, brandsRes] = await Promise.all([
      productApi.getAll(),
      brandApi.getAll()
    ])
    products.value = Array.isArray(productsRes.data) ? productsRes.data : []
    brands.value = Array.isArray(brandsRes.data) ? brandsRes.data : []
  } catch (e) {
    console.error(e)
  } finally { loading.value = false }
}

function openCreate() {
  editingId.value = null
  form.value      = blank()
  formError.value = ''
  showModal.value = true
}

function openEdit(p) {
  editingId.value = p.id
  form.value = {
    name:       p.name,
    price:      p.price,
    stock:      p.stockQuantity,  // ✅ map đúng field backend
    brandId:    p.brandId ?? '',
    categoryId: p.categoryId,     // ✅ lấy đúng từ product
    imageFile: null,
    imageName: '',
    imagePrimary: true
  }
  formError.value = ''
  showModal.value = true
}

function onImageChange(event) {
  const file = event.target.files?.[0] || null
  form.value.imageFile = file
  form.value.imageName = file?.name || ''
}

async function handleSubmit() {
  formError.value  = ''
  submitting.value = true
  try {
    if (!form.value.brandId) {
      formError.value = 'Chọn thương hiệu.'
      return
    }

    const payload = {
      name: form.value.name,
      price: form.value.price,
      stock: form.value.stock,
      brandId: Number(form.value.brandId),
      categoryId: form.value.categoryId
    }

    const saved = editingId.value
      ? await productApi.update(editingId.value, payload)
      : await productApi.create(payload)

    const productId = saved?.data?.id
    if (form.value.imageFile && productId) {
      const imageForm = new FormData()
      imageForm.append('ProductId', String(productId))
      imageForm.append('ImageFile', form.value.imageFile)
      imageForm.append('IsPrimary', String(form.value.imagePrimary))
      await productImageApi.upload(imageForm)
    }

    showModal.value = false
    await load()
  } catch (e) {
    const d = e.response?.data
    formError.value = d?.message || d?.title || `Lỗi ${e.response?.status}`
  } finally { submitting.value = false }
}

async function handleDelete(id) {
  if (!confirm('Xác nhận xóa?')) return
  try {
    await productApi.delete(id)
    await load()
  } catch (e) {
    alert(e.response?.data?.message || 'Xóa thất bại.')
  }
}

const fmt = v =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

onMounted(load)
</script>

<style scoped>
.low-stock { color: #e67e22; font-weight: 600; }
.badge-warning { background: #f1c40f; color: #000; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
</style>
