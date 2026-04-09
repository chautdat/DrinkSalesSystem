<template>
  <div class="container">
    <div class="page-header"><h1>👤 Tài khoản của tôi</h1></div>

    <div class="profile-layout">

      <!-- Sidebar -->
      <div class="sidebar">
        <div class="avatar">
          {{ initials }}
        </div>
        <div class="sidebar-name">{{ form.fullName || user?.email }}</div>
        <div class="sidebar-email">{{ user?.email }}</div>
        <div class="sidebar-role">
          <span class="badge badge-info">Nhân viên</span>
        </div>
        <div class="sidebar-menu">
          <button :class="['sm-btn', { active: tab === 'info' }]" @click="tab = 'info'">
            📋 Thông tin cá nhân
          </button>
          <button :class="['sm-btn', { active: tab === 'orders' }]"
            @click="$router.push('/orders')">
            📦 Lịch sử đơn hàng
          </button>
          <button :class="['sm-btn', { active: tab === 'cart' }]"
            @click="$router.push('/cart')">
            🛒 Giỏ hàng
          </button>
        </div>
      </div>

      <!-- Main content -->
      <div class="main-content">
        <div class="card">
          <div class="modal-title" style="border:none;margin-bottom:20px">
            Thông tin cá nhân
          </div>

          <div v-if="loading" class="loading-text">Đang tải…</div>
          <form v-else @submit.prevent="handleSave">
            <div class="form-group">
              <label>Email</label>
              <input class="form-control" :value="user?.email" disabled
                style="background:#f5f7fa;color:#9aa0a6" />
              <small style="color:#9aa0a6;font-size:12px">Email không thể thay đổi</small>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Họ và tên *</label>
                <input class="form-control" v-model="form.fullName"
                  placeholder="Nhập họ và tên" required />
              </div>
              <div class="form-group">
                <label>Số điện thoại</label>
                <input class="form-control" v-model="form.phone"
                  placeholder="0901234567" />
              </div>
            </div>
            <div class="form-group">
              <label>Địa chỉ</label>
              <input class="form-control" v-model="form.address"
                placeholder="Số nhà, đường, phường, quận, tỉnh/thành phố" />
            </div>

            <div v-if="saveMsg" :class="`alert alert-${saveOk ? 'success' : 'error'}`">
              {{ saveMsg }}
            </div>

            <div style="display:flex;gap:10px;justify-content:flex-end">
              <button type="button" class="btn btn-secondary" @click="loadProfile">
                Hủy thay đổi
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Đang lưu…' : '💾 Lưu thay đổi' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { userApi } from '../../services/api.js'

const user    = computed(() => JSON.parse(sessionStorage.getItem('user') || '{}'))
const tab     = ref('info')
const loading = ref(true)
const saving  = ref(false)
const saveMsg = ref('')
const saveOk  = ref(false)

const form = ref({ fullName: '', phone: '', address: '' })

const initials = computed(() => {
  const name = form.value.fullName || user.value?.email || ''
  return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || 'U'
})

async function loadProfile() {
  loading.value = true
  try {
    const { data } = await userApi.getProfile()
    form.value = { fullName: data.fullName, phone: data.phone, address: data.address }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function handleSave() {
  saving.value = true
  saveMsg.value = ''
  try {
    const { data } = await userApi.updateProfile(form.value)
    // Cập nhật sessionStorage
    const u = JSON.parse(sessionStorage.getItem('user') || '{}')
    u.fullName = data.fullName
    u.phone    = data.phone
    u.address  = data.address
    sessionStorage.setItem('user', JSON.stringify(u))

    saveMsg.value = 'Cập nhật thông tin thành công!'
    saveOk.value  = true
    setTimeout(() => saveMsg.value = '', 3000)
  } catch (e) {
    saveMsg.value = e.response?.data?.message || 'Cập nhật thất bại.'
    saveOk.value  = false
  } finally { saving.value = false }
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-layout { display: grid; grid-template-columns: 240px 1fr; gap: 20px; }
.sidebar {
  background: #fff; border: 1px solid #e8eaed;
  border-radius: 12px; padding: 24px; text-align: center;
  align-self: start;
}
.avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: #e8f0fe; color: #1a73e8;
  font-size: 24px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.sidebar-name  { font-size: 15px; font-weight: 600; color: #1e2329; }
.sidebar-email { font-size: 12.5px; color: #9aa0a6; margin: 4px 0 8px; }
.sidebar-role  { margin-bottom: 16px; }
.sidebar-menu  { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.sm-btn {
  padding: 10px 14px; border-radius: 8px;
  border: none; background: transparent;
  cursor: pointer; font-size: 13.5px; text-align: left; color: #5f6368;
}
.sm-btn:hover  { background: #f1f3f4; }
.sm-btn.active { background: #e8f0fe; color: #1a73e8; font-weight: 500; }
.main-content  { min-width: 0; }
</style>