<template>
  <div class="container">
    <div class="page-header">
      <h1>Khuyến mãi & Mã giảm giá</h1>
      <button class="btn btn-primary" @click="openCreate">+ Tạo khuyến mãi</button>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-text">Đang tải…</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
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
            <tr v-for="promo in promotions" :key="promo.id">
              <td>{{ promo.code }}</td>
              <td>{{ promo.discount }}%</td>
              <td>{{ promo.applyFor || 'Tất cả' }}</td>
              <td>{{ promo.expireDate || 'Vô thời hạn' }}</td>
              <td>{{ promo.usageCount || 0 }} / {{ promo.maxUsage || '∞' }}</td>
              <td>
                <span :class="promo.isActive ? 'badge badge-success' : 'badge badge-danger'">
                  {{ promo.isActive ? 'Hoạt động' : 'Hết hạn' }}
                </span>
              </td>
              <td>
                <button class="btn btn-secondary btn-sm">Sửa</button>
                <button class="btn btn-danger btn-sm">Xóa</button>
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
// Giả sử có promotionApi
const promotions = ref([])
const loading = ref(true)

onMounted(async () => {
  // load từ API
  promotions.value = [] // placeholder
  loading.value = false
})
</script>