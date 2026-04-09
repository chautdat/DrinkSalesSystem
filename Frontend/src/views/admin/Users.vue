<template>
  <div class="container">
    <div class="page-header">
      <h1>Quản lý khách hàng</h1>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-text">Đang tải…</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Địa chỉ</th>
              <th>Số đơn</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>#{{ u.id }}</td>
              <td>{{ u.fullName || '—' }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.phone || '—' }}</td>
              <td>{{ u.address || '—' }}</td>
              <td>{{ u.orderCount || 0 }}</td>
              <td>
                <span :class="u.isLocked ? 'badge badge-danger' : 'badge badge-success'">
                  {{ u.isLocked ? 'Đã khóa' : 'Hoạt động' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm" :class="u.isLocked ? 'btn-success' : 'btn-danger'" @click="toggleLock(u.id)">
                  {{ u.isLocked ? 'Mở khóa' : 'Khóa' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '../../services/api.js'

const users = ref([])
const loading = ref(true)

async function loadUsers() {
  loading.value = true
  try {
    const { data } = await userApi.getAllUsers() // giả sử có API này
    users.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function toggleLock(id) {
  if (!confirm('Xác nhận thay đổi trạng thái tài khoản?')) return
  try {
    await userApi.toggleLock(id)
    await loadUsers()
  } catch (e) {
    alert('Thao tác thất bại')
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.low-stock { color: #e67e22; font-weight: 600; }
.badge-warning { background: #f1c40f; color: #000; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
</style>