<template>
  <div class="container">
    <div class="page-header">
      <h1>Khuyến mãi & Mã giảm giá</h1>
      <button class="btn btn-primary" @click="openCreate">+ Tạo khuyến mãi</button>
    </div>

    <div class="card" style="margin-bottom:16px;padding:14px 20px;display:flex;gap:12px;align-items:center">
      <input class="form-control" v-model="search" placeholder="Tìm mã khuyến mãi…" style="max-width:300px" />
      <span style="margin-left:auto;font-size:13px;color:#9aa0a6">
        {{ filtered.length }} khuyến mãi
      </span>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-text">Đang tải…</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:60px">STT</th>
              <th>Mã</th>
              <th>Giảm giá</th>
              <th>Áp dụng cho</th>
              <th>Hiệu lực đến</th>
              <th>Số lần dùng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(promo, index) in filtered" :key="promo.id">
              <td style="color:#9aa0a6">{{ index + 1 }}</td>
              <td>{{ promo.code }}</td>
              <td>{{ promo.discount }}%</td>
              <td>{{ promo.applyFor || 'Tất cả' }}</td>
              <td>{{ fmtDate(promo.expireDate) }}</td>
              <td>{{ promo.usageCount || 0 }} / {{ promo.maxUsage || '∞' }}</td>
              <td>
                <span :class="badgeOf(promo).cls">
                  {{ badgeOf(promo).label }}
                </span>
              </td>
              <td>
                <button class="btn btn-secondary btn-sm" style="margin-right:6px" @click="openEdit(promo)">Sửa</button>
                <button class="btn btn-danger btn-sm" @click="handleDelete(promo.id)">Xóa</button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="8" class="loading-text">Chưa có dữ liệu.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-title">{{ editingId ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi mới' }}</div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Mã khuyến mãi *</label>
            <input class="form-control" v-model="form.code" placeholder="VD: WELCOME10" required />
          </div>

          <div class="form-group">
            <label>Giảm giá (%) *</label>
            <input class="form-control" v-model.number="form.discount" type="number" min="1" max="100" required />
          </div>

          <div class="form-group">
            <label>Áp dụng cho</label>
            <input class="form-control" v-model="form.applyFor" placeholder="VD: Tất cả / Sản phẩm / Đơn hàng" />
          </div>

          <div class="form-group">
            <label>Hiệu lực đến</label>
            <input class="form-control" v-model="form.expireDate" type="date" />
          </div>

          <div class="form-group">
            <label>Số lần dùng tối đa</label>
            <input class="form-control" v-model.number="form.maxUsage" type="number" min="0" placeholder="0 = không giới hạn" />
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="form.isActive" />
              Hoạt động
            </label>
          </div>

          <div v-if="formError" class="alert alert-error">{{ formError }}</div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
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
import { computed, onMounted, ref } from 'vue'
import { promotionApi } from '../../services/api.js'
import { idKey } from '../../utils/display.js'

const promotions = ref([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formError = ref('')

const blank = () => ({
  code: '',
  discount: 10,
  applyFor: 'Tất cả',
  expireDate: '',
  maxUsage: 0,
  isActive: true
})

const form = ref(blank())

const filtered = computed(() =>
  promotions.value.filter(item =>
    `${item.code} ${item.applyFor || ''}`.toLowerCase().includes(search.value.toLowerCase())
  )
)

onMounted(async () => {
  await load()
})

function toDateInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fmtDate(value) {
  if (!value) return 'Vô thời hạn'
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'Vô thời hạn'
  return date.toLocaleDateString('vi-VN')
}

function badgeOf(item) {
  const now = Date.now()
  const expireTime = item.expireDate ? new Date(item.expireDate).getTime() : null
  const maxUsage = Number(item.maxUsage || 0)
  const usageCount = Number(item.usageCount || 0)

  if (!item.isActive) {
    return { label: 'Tạm tắt', cls: 'badge badge-danger' }
  }
  if (expireTime && expireTime < now) {
    return { label: 'Hết hạn', cls: 'badge badge-warning' }
  }
  if (maxUsage > 0 && usageCount >= maxUsage) {
    return { label: 'Đã hết lượt', cls: 'badge badge-warning' }
  }
  return { label: 'Hoạt động', cls: 'badge badge-success' }
}

async function load() {
  loading.value = true
  try {
    const { data } = await promotionApi.getAll()
    promotions.value = (Array.isArray(data) ? data : []).map(item => ({
      ...item,
      id: idKey(item.id || item._id)
    }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = blank()
  formError.value = ''
  showModal.value = true
}

function openEdit(item) {
  editingId.value = item.id
  form.value = {
    code: item.code || '',
    discount: Number(item.discount || 0),
    applyFor: item.applyFor || 'Tất cả',
    expireDate: toDateInput(item.expireDate),
    maxUsage: Number(item.maxUsage || 0),
    isActive: !!item.isActive
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formError.value = ''
}

async function handleSubmit() {
  submitting.value = true
  formError.value = ''
  try {
    const payload = {
      code: form.value.code.trim(),
      discount: Number(form.value.discount),
      applyFor: form.value.applyFor?.trim() || 'Tất cả',
      expireDate: form.value.expireDate || null,
      maxUsage: form.value.maxUsage === '' || form.value.maxUsage === null ? 0 : Number(form.value.maxUsage),
      isActive: form.value.isActive
    }

    if (editingId.value) {
      await promotionApi.update(editingId.value, payload)
    } else {
      await promotionApi.create(payload)
    }

    closeModal()
    await load()
  } catch (e) {
    formError.value = e.response?.data?.message || 'Lưu thất bại.'
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Xác nhận xóa khuyến mãi này?')) return
  try {
    await promotionApi.delete(id)
    await load()
  } catch (e) {
    alert(e.response?.data?.message || 'Xóa thất bại.')
  }
}
</script>
