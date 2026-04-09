<template>
  <div class="container">
    <div class="page-header">
      <h1>Quản lý tài khoản Admin</h1>
      <button class="btn btn-primary" @click="openCreate">+ Thêm Admin</button>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-text">Đang tải…</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Họ tên</th>
              <th>Quyền hạn</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in admins" :key="a.id">
              <td>#{{ a.id }}</td>
              <td>{{ a.email }}</td>
              <td>{{ a.fullName || '—' }}</td>
              <td>{{ a.role || 'Admin' }}</td>
              <td>
                <span class="badge badge-success">Hoạt động</span>
              </td>
              <td>
                <button class="btn btn-danger btn-sm" @click="handleDelete(a.id)">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal thêm Admin -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-title">Thêm tài khoản Admin mới</div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Email *</label>
            <input class="form-control" v-model="form.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Mật khẩu *</label>
            <input class="form-control" v-model="form.password" type="password" required />
          </div>
          <div class="form-group">
            <label>Họ tên</label>
            <input class="form-control" v-model="form.fullName" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">Hủy</button>
            <button type="submit" class="btn btn-primary">Thêm Admin</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '../../services/api.js' // giả sử có api riêng cho admin

const admins = ref([])
const loading = ref(true)
const showModal = ref(false)
const form = ref({ email: '', password: '', fullName: '' })

async function loadAdmins() {
  loading.value = true
  try {
    const { data } = await adminApi.getAll()
    admins.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { email: '', password: '', fullName: '' }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await adminApi.create(form.value)
    showModal.value = false
    await loadAdmins()
  } catch (e) {
    alert('Thêm Admin thất bại')
  }
}

async function handleDelete(id) {
  if (!confirm('Xác nhận xóa Admin này?')) return
  try {
    await adminApi.delete(id)
    await loadAdmins()
  } catch (e) {
    alert('Xóa thất bại')
  }
}

onMounted(loadAdmins)
</script>