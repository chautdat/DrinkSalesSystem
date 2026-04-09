<template>
  <div class="container">
    <div class="page-header">
      <h1>Phương thức thanh toán</h1>
      <button class="btn btn-primary" @click="openCreate">+ Thêm phương thức</button>
    </div>

    <div class="card" style="margin-bottom:16px;padding:14px 20px;display:flex;gap:12px;align-items:center">
      <input class="form-control" v-model="search" placeholder="Tìm phương thức…" style="max-width:300px" />
      <span style="margin-left:auto;font-size:13px;color:#9aa0a6">
        {{ filtered.length }} phương thức
      </span>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-text">Đang tải…</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th>Tên phương thức</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th style="width:160px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.id">
              <td style="color:#9aa0a6">#{{ item.id }}</td>
              <td style="font-weight:500">{{ item.name }}</td>
              <td>{{ item.description || '—' }}</td>
              <td>
                <span :class="item.isActive ? 'badge badge-success' : 'badge badge-danger'">
                  {{ item.isActive ? 'Hoạt động' : 'Tạm tắt' }}
                </span>
              </td>
              <td style="color:#9aa0a6;font-size:13px">{{ fmtDate(item.createdAt) }}</td>
              <td>
                <button class="btn btn-secondary btn-sm" style="margin-right:6px" @click="openEdit(item)">Sửa</button>
                <button class="btn btn-danger btn-sm" @click="handleDelete(item.id)">Xóa</button>
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
        <div class="modal-title">{{ editingId ? 'Cập nhật phương thức' : 'Thêm phương thức thanh toán' }}</div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Tên phương thức *</label>
            <input class="form-control" v-model="form.name" required />
          </div>

          <div class="form-group">
            <label>Mô tả</label>
            <textarea class="form-control" v-model="form.description" rows="3"></textarea>
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
import { paymentMethodApi } from '../../services/api.js'

const items = ref([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formError = ref('')

const blank = () => ({
  name: '',
  description: '',
  isActive: true
})

const form = ref(blank())

const filtered = computed(() =>
  items.value.filter(item =>
    `${item.name} ${item.description || ''}`.toLowerCase().includes(search.value.toLowerCase())
  )
)

async function load() {
  loading.value = true
  try {
    const { data } = await paymentMethodApi.getAll()
    items.value = Array.isArray(data) ? data : []
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
    name: item.name || '',
    description: item.description || '',
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
      name: form.value.name.trim(),
      description: form.value.description?.trim() || '',
      isActive: form.value.isActive
    }

    if (editingId.value) {
      await paymentMethodApi.update(editingId.value, payload)
    } else {
      await paymentMethodApi.create(payload)
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
  if (!confirm('Xác nhận xóa phương thức này?')) return
  try {
    await paymentMethodApi.delete(id)
    await load()
  } catch (e) {
    alert(e.response?.data?.message || 'Xóa thất bại.')
  }
}

const fmtDate = d => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('vi-VN')
}

onMounted(load)
</script>
