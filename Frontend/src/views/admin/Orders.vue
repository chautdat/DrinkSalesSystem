<template>
  <div class="container">
    <div class="page-header">
      <h1>Đơn hàng</h1>
      <button class="btn btn-primary" @click="openCreate">+ Tạo đơn hàng</button>
    </div>
  <div class="status-filter" style="margin:16px 0;display:flex;gap:8px;flex-wrap:wrap">
    <button 
      v-for="status in ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']"
      :key="status"
      class="btn btn-sm"
      :class="{ 'btn-primary': activeStatus === status, 'btn-secondary': activeStatus !== status }"
      @click="activeStatus = status"
    >
      {{ status === 'All' ? 'Tất cả' : labelOf(status) }}
    </button>
  </div>

    <div class="card">
      <div v-if="loading" class="loading-text">Đang tải…</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th>User ID</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in filteredOrders" :key="o.id">
              <td style="color:#9aa0a6">#{{ o.id }}</td>
              <td>User #{{ o.userId }}</td>
              <td style="font-weight:600;color:#1a73e8">{{ fmt(o.total) }}</td>
              <td>
                <span :class="`badge ${badgeOf(o.status)}`">
                  {{ labelOf(o.status) }}
                </span>
              </td>
              <td style="color:#9aa0a6;font-size:13px">
                {{ fmtDate(o.createdAt) }}
              </td>
              <td>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <button class="btn btn-secondary btn-sm"
                    @click="detail = o">Chi tiết</button>
                  <template v-if="isAdmin">
                    <button
                      v-for="next in nextOf(o.status)" :key="next.val"
                      :class="`btn btn-sm btn-${next.color}`"
                      @click="doStatus(o.id, next.val)">
                      {{ next.label }}
                    </button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredOrders.length">
              <td colspan="6" class="loading-text">
                {{ activeStatus === 'All' ? 'Chưa có đơn hàng nào.' : `Không có đơn hàng "${labelOf(activeStatus)}".` }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal tạo đơn -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <div class="modal-title">Tạo đơn hàng mới</div>

        <!-- Admin nhập userId tay, User tự động dùng id của mình -->
        <div v-if="isAdmin" class="form-group">
          <label>User ID *</label>
          <input class="form-control" v-model.number="cForm.userId"
            type="number" min="1" placeholder="Nhập ID người dùng" />
        </div>
        <div v-else class="form-group">
          <label>Tạo đơn cho</label>
          <input class="form-control"
            :value="`User #${cForm.userId} (tài khoản của bạn)`"
            disabled style="background:#f5f7fa;color:#9aa0a6" />
        </div>

        <div class="form-group">
          <label>Tổng tiền (VNĐ) *</label>
          <input class="form-control" v-model.number="cForm.total"
            type="number" min="0" />
        </div>

        <div class="form-group">
          <label>Phương thức thanh toán *</label>
          <select class="form-control" v-model="cForm.paymentMethodId">
            <option value="">-- Chọn phương thức --</option>
            <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
              {{ method.name }}
            </option>
          </select>
        </div>

        <div v-if="cError" class="alert alert-error">{{ cError }}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreate = false">Hủy</button>
          <button class="btn btn-primary" :disabled="submitting" @click="submitOrder">
            {{ submitting ? 'Đang tạo…' : 'Tạo đơn hàng' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal chi tiết -->
    <div v-if="detail" class="modal-overlay" @click.self="detail = null">
      <div class="modal">
        <div class="modal-title">Chi tiết đơn hàng #{{ detail.id }}</div>
        <table style="width:100%;font-size:14px;margin-bottom:16px">
          <tbody>
            <tr>
              <td style="color:#9aa0a6;padding:7px 0;width:120px">ID</td>
              <td><strong>#{{ detail.id }}</strong></td>
            </tr>
            <tr>
              <td style="color:#9aa0a6;padding:7px 0">User ID</td>
              <td>{{ detail.userId }}</td>
            </tr>
            <tr>
              <td style="color:#9aa0a6;padding:7px 0">Tổng tiền</td>
              <td style="font-weight:600;color:#1a73e8">{{ fmt(detail.total) }}</td>
            </tr>
            <tr>
              <td style="color:#9aa0a6;padding:7px 0">Phương thức thanh toán</td>
              <td>{{ detail.paymentMethodName || '—' }}</td>
            </tr>
            <tr>
              <td style="color:#9aa0a6;padding:7px 0">Trạng thái</td>
              <td>
                <span :class="`badge ${badgeOf(detail.status)}`">
                  {{ labelOf(detail.status) }}
                </span>
              </td>
            </tr>
            <tr>
              <td style="color:#9aa0a6;padding:7px 0">Ngày tạo</td>
              <td>{{ fmtDate(detail.createdAt) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="isAdmin && nextOf(detail.status).length > 0">
          <div style="font-size:13px;color:#5f6368;margin-bottom:8px">
            Chuyển trạng thái:
          </div>
          <div style="display:flex;gap:8px">
            <button
              v-for="next in nextOf(detail.status)" :key="next.val"
              :class="`btn btn-${next.color}`"
              @click="doStatusDetail(detail.id, next.val)">
              {{ next.label }}
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="detail = null">Đóng</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { orderApi, paymentMethodApi } from '../../services/api.js'

const orders     = ref([])
const loading    = ref(true)
const showCreate = ref(false)
const detail     = ref(null)
const submitting = ref(false)
const cError     = ref('')
const paymentMethods = ref([])

// ✅ Lấy thông tin user từ sessionStorage
const user = JSON.parse(sessionStorage.getItem('user') || '{}')
const isAdmin = computed(() => user.role === 'Admin')
const activeStatus = ref('All')

const filteredOrders = computed(() => {
  if (activeStatus.value === 'All') return orders.value
  return orders.value.filter(o => o.status === activeStatus.value)
})
// ✅ userId tự động từ token — User không cần nhập tay
const cForm = ref({
  userId: user.id ?? '',
  total: 0,
  paymentMethodId: ''
})

const LABELS = {
  Pending:   'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Shipped:   'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy'
}
const BADGES = {
  Pending:   'badge-warning',
  Confirmed: 'badge-info',
  Shipped:   'badge-ok',
  Delivered: 'badge-ok',
  Cancelled: 'badge-danger'
}
const NEXTS = {
  Pending:   [
    { val: 'Confirmed', label: 'Xác nhận',  color: 'primary' },
    { val: 'Cancelled', label: 'Hủy đơn',   color: 'danger'  }
  ],
  Confirmed: [{ val: 'Shipped',   label: 'Giao hàng', color: 'success' }],
  Shipped:   [{ val: 'Delivered', label: 'Đã giao',   color: 'success' }]
}

const labelOf = s => LABELS[s] ?? s
const badgeOf = s => BADGES[s] ?? 'badge-info'
const nextOf  = s => NEXTS[s]  ?? []

async function load() {
  loading.value = true
  try {
    const { data } = await orderApi.getAll()
    orders.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error(e)
  } finally { loading.value = false }
}

async function loadLookups() {
  try {
    const { data } = await paymentMethodApi.getAll()
    paymentMethods.value = (Array.isArray(data) ? data : []).filter(m => m.isActive)
  } catch (e) {
    paymentMethods.value = []
  }
}

function openCreate() {
  cForm.value  = {
    userId: user.id ?? '',
    total: 0,
    paymentMethodId: ''
  }
  cError.value = ''
  showCreate.value = true
}

async function submitOrder() {
  if (!cForm.value.userId) {
    cError.value = 'Không xác định được User ID.'
    return
  }
  if (!cForm.value.paymentMethodId) {
    cError.value = 'Chọn phương thức thanh toán.'
    return
  }
  cError.value     = ''
  submitting.value = true
  try {
    await orderApi.create({
      userId: Number(cForm.value.userId),
      total:  Number(cForm.value.total),
      paymentMethodId: Number(cForm.value.paymentMethodId)
    })
    showCreate.value = false
    await load()
  } catch (e) {
    cError.value = e.response?.data?.message || `Lỗi ${e.response?.status}`
  } finally { submitting.value = false }
}

async function doStatus(id, status) {
  if (!confirm(`Chuyển sang "${labelOf(status)}"?`)) return
  try { await orderApi.updateStatus(id, status); await load() }
  catch (e) { alert(e.response?.data?.message || 'Lỗi.') }
}

async function doStatusDetail(id, status) {
  if (!confirm(`Chuyển sang "${labelOf(status)}"?`)) return
  try {
    await orderApi.updateStatus(id, status)
    detail.value = null
    await load()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi.') }
}

const fmt = v =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

const fmtDate = d => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime()) || date.getFullYear() < 2000) return '—'
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  load()
  loadLookups()
})
</script>
