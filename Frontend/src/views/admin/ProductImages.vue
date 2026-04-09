<template>
  <div class="container">
    <div class="page-header">
      <h1>Ảnh sản phẩm</h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary" @click="openUpload">+ Upload ảnh</button>
        <button class="btn btn-primary" @click="openCreateUrl">+ Thêm bằng URL</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px;padding:14px 20px;display:flex;gap:12px;align-items:center">
      <input class="form-control" v-model="search" placeholder="Tìm ảnh / sản phẩm…" style="max-width:300px" />
      <span style="margin-left:auto;font-size:13px;color:#9aa0a6">
        {{ filtered.length }} ảnh
      </span>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-text">Đang tải…</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th>Sản phẩm</th>
              <th>Ảnh</th>
              <th>Chính</th>
              <th>Đường dẫn</th>
              <th style="width:160px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="img in filtered" :key="img.id">
              <td style="color:#9aa0a6">#{{ img.id }}</td>
              <td>
                <div style="font-weight:500">{{ productName(img.productId) }}</div>
                <div style="font-size:12px;color:#9aa0a6">Product #{{ img.productId }}</div>
              </td>
              <td>
                <img
                  v-if="resolveImageUrl(img.imageUrl)"
                  :src="resolveImageUrl(img.imageUrl)"
                  alt="Ảnh sản phẩm"
                  class="image-thumb"
                />
                <span v-else>—</span>
              </td>
              <td>
                <span :class="img.isPrimary ? 'badge badge-success' : 'badge badge-info'">
                  {{ img.isPrimary ? 'Ảnh chính' : 'Ảnh phụ' }}
                </span>
              </td>
              <td style="font-size:12px">
                <code>{{ img.imageUrl }}</code>
              </td>
              <td>
                <button class="btn btn-secondary btn-sm" style="margin-right:6px" @click="openEdit(img)">Sửa</button>
                <button class="btn btn-danger btn-sm" @click="handleDelete(img.id)">Xóa</button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="6" class="loading-text">Chưa có dữ liệu.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-title">
          {{ editingId ? 'Cập nhật ảnh sản phẩm' : (modalMode === 'upload' ? 'Upload ảnh sản phẩm' : 'Thêm ảnh bằng URL') }}
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Sản phẩm *</label>
            <select class="form-control" v-model.number="form.productId" required>
              <option :value="null">-- Chọn sản phẩm --</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                {{ p.name }} (#{{ p.id }})
              </option>
            </select>
          </div>

          <div v-if="modalMode === 'upload' && !editingId" class="form-group">
            <label>Chọn file ảnh *</label>
            <input class="form-control" type="file" accept="image/*" @change="onFileChange" :required="modalMode === 'upload'" />
            <small style="display:block;color:#9aa0a6;font-size:12px;margin-top:6px">
              File sẽ được lưu vào <code>/uploads/product-images</code>.
            </small>
          </div>

          <div v-else class="form-group">
            <label>Đường dẫn ảnh *</label>
            <input class="form-control" v-model="form.imageUrl" placeholder="/uploads/... hoặc URL đầy đủ" required />
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="form.isPrimary" />
              Ảnh chính
            </label>
          </div>

          <div v-if="formError" class="alert alert-error">{{ formError }}</div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Đang lưu…' : (editingId ? 'Cập nhật' : 'Lưu ảnh') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { productApi, productImageApi } from '../../services/api.js'

const products = ref([])
const images = ref([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formError = ref('')
const modalMode = ref('upload')

const blank = () => ({
  productId: null,
  imageUrl: '',
  imageFile: null,
  isPrimary: false
})

const form = ref(blank())

const productMap = computed(() => {
  const map = new Map()
  products.value.forEach(p => map.set(Number(p.id), p))
  return map
})

const filtered = computed(() =>
  images.value.filter(item =>
    `${productName(item.productId)} ${item.imageUrl || ''}`.toLowerCase().includes(search.value.toLowerCase())
  )
)

function productName(id) {
  return productMap.value.get(Number(id))?.name || `Product #${id}`
}

function resolveImageUrl(url) {
  if (!url) return ''
  return url.startsWith('http') ? url : url
}

async function load() {
  loading.value = true
  try {
    const [productsRes, imagesRes] = await Promise.all([
      productApi.getAll(),
      productImageApi.getAll()
    ])
    products.value = Array.isArray(productsRes.data) ? productsRes.data : []
    images.value = Array.isArray(imagesRes.data) ? imagesRes.data : []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = blank()
  formError.value = ''
}

function openUpload() {
  editingId.value = null
  modalMode.value = 'upload'
  resetForm()
  showModal.value = true
}

function openCreateUrl() {
  editingId.value = null
  modalMode.value = 'url'
  resetForm()
  showModal.value = true
}

function openEdit(item) {
  editingId.value = item.id
  modalMode.value = 'url'
  form.value = {
    productId: item.productId,
    imageUrl: item.imageUrl || '',
    imageFile: null,
    isPrimary: !!item.isPrimary
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formError.value = ''
}

function onFileChange(event) {
  const file = event.target.files?.[0] || null
  form.value.imageFile = file
}

async function handleSubmit() {
  submitting.value = true
  formError.value = ''

  try {
    if (modalMode.value === 'upload' && !editingId.value) {
      if (!form.value.imageFile) {
        formError.value = 'Chọn file ảnh trước khi upload.'
        return
      }

      const payload = new FormData()
      payload.append('ProductId', String(form.value.productId))
      payload.append('ImageFile', form.value.imageFile)
      payload.append('IsPrimary', String(form.value.isPrimary))

      await productImageApi.upload(payload)
    } else {
      const payload = {
        productId: Number(form.value.productId),
        imageUrl: form.value.imageUrl.trim(),
        isPrimary: form.value.isPrimary
      }

      if (editingId.value) {
        await productImageApi.update(editingId.value, payload)
      } else {
        await productImageApi.create(payload)
      }
    }

    closeModal()
    await load()
  } catch (e) {
    formError.value = e.response?.data?.message || e.response?.data?.title || 'Lưu thất bại.'
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Xác nhận xóa ảnh này?')) return
  try {
    await productImageApi.delete(id)
    await load()
  } catch (e) {
    alert(e.response?.data?.message || 'Xóa thất bại.')
  }
}

onMounted(load)
</script>

<style scoped>
.image-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  display: block;
}
</style>
