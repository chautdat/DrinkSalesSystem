<template>
  <div class="login-page">
    <div class="login-card">

      <div class="login-header">
        <div style="font-size:40px;margin-bottom:10px">💧</div>
        <h1>Mineral Water</h1>
        <p style="font-size:13px;color:#9aa0a6;margin-top:4px">
          Hệ thống quản lý
        </p>
      </div>

      <div class="tab-bar">
        <button
          :class="['tab-btn',{active:tab==='login'}]"
          @click="tab='login'">
          Đăng nhập
        </button>

        <button
          :class="['tab-btn',{active:tab==='register'}]"
          @click="tab='register'">
          Đăng ký
        </button>
      </div>

      <!-- LOGIN -->
      <form v-if="tab==='login'" @submit.prevent="handleLogin">

        <div class="form-group">
          <label>Email</label>
          <input
            class="form-control"
            v-model="loginForm.email"
            type="email"
            placeholder="admin@gmail.com"
            required />
        </div>

        <div class="form-group">
          <label>Mật khẩu</label>
          <input
            class="form-control"
            v-model="loginForm.password"
            type="password"
            placeholder="••••••••"
            required />
        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width:100%;justify-content:center;padding:10px"
          :disabled="loading">

          {{ loading ? 'Đang đăng nhập…' : 'Đăng nhập' }}

        </button>

        <p style="font-size:12px;color:#9aa0a6;text-align:center;margin-top:12px">
          Tài khoản Admin:
          <code>admin@gmail.com</code>
          /
          <code>Admin@123</code>
        </p>

      </form>


      <!-- REGISTER -->
      <form v-else @submit.prevent="handleRegister">

        <div class="form-group">
          <label>Email</label>
          <input
            class="form-control"
            v-model="regForm.email"
            type="email"
            placeholder="email@example.com"
            required />
        </div>

        <div class="form-group">
          <label>Mật khẩu</label>
          <input
            class="form-control"
            v-model="regForm.password"
            type="password"
            placeholder="••••••••"
            required />
        </div>

        <!-- HỌ TÊN -->
        <div class="form-group">
          <label>Họ và tên *</label>
          <input
            class="form-control"
            v-model="regForm.fullName"
            type="text"
            placeholder="Nguyễn Văn A"
            required />
        </div>

        <!-- PHONE + ADDRESS -->
        <div class="grid-2">

          <div class="form-group">
            <label>Số điện thoại</label>
            <input
              class="form-control"
              v-model="regForm.phone"
              type="text"
              placeholder="0901234567" />
          </div>

          <div class="form-group">
            <label>Địa chỉ</label>
            <input
              class="form-control"
              v-model="regForm.address"
              placeholder="Địa chỉ giao hàng" />
          </div>

        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width:100%;justify-content:center;padding:10px"
          :disabled="loading">

          {{ loading ? 'Đang đăng ký…' : 'Đăng ký' }}

        </button>

      </form>

    </div>
  </div>
</template>


<script setup>

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../services/api.js'

const router = useRouter()

const tab = ref('login')
const error = ref('')
const loading = ref(false)

const loginForm = ref({
  email:'',
  password:''
})

const regForm = ref({
  email:'',
  password:'',
  fullName:'',
  phone:'',
  address:''
})


function saveSession(data) {
  sessionStorage.setItem('token', data.token)
  sessionStorage.setItem('user',
    JSON.stringify({
      id:       data.id,
      email:    data.email,
      role:     data.role,
      fullName: data.fullName || '',
      phone:    data.phone    || '',
      address:  data.address  || ''
    })
  )

  if (data.role === 'Admin') {
    router.push('/admin')
  } else {
    router.push('/home')
  }
}



async function handleLogin(){

  error.value=''
  loading.value=true

  try{

    const {data}=await authApi.login(loginForm.value)

    saveSession(data)

  }
  catch(e){

    error.value =
      e.response?.data?.message ||
      'Email hoặc mật khẩu không đúng.'

  }
  finally{

    loading.value=false

  }

}



async function handleRegister(){

  error.value=''
  loading.value=true

  try{

    const {data}=await authApi.register(regForm.value)

    saveSession(data)

  }
  catch(e){

    error.value =
      e.response?.data?.message ||
      'Đăng ký thất bại.'

  }
  finally{

    loading.value=false

  }

}

</script>



<style scoped>

.login-page{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#f0f4ff;
}

.login-card{
  background:#fff;
  border-radius:14px;
  padding:40px 36px;
  width:420px;
  max-width:96vw;
  border:1px solid #e8eaed;
}

.login-header{
  text-align:center;
  margin-bottom:28px;
}

h1{
  font-size:22px;
  font-weight:700;
  color:#1a73e8;
}

.tab-bar{
  display:flex;
  border:1px solid #e8eaed;
  border-radius:8px;
  overflow:hidden;
  margin-bottom:24px;
}

.tab-btn{
  flex:1;
  padding:9px 0;
  border:none;
  background:#fff;
  cursor:pointer;
  font-size:14px;
  font-weight:500;
  color:#5f6368;
}

.tab-btn.active{
  background:#1a73e8;
  color:#fff;
}

.form-group{
  margin-bottom:14px;
}

.form-control{
  width:100%;
  padding:8px 10px;
  border:1px solid #dadce0;
  border-radius:6px;
}

.grid-2{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

.btn{
  border:none;
  border-radius:6px;
  cursor:pointer;
}

.btn-primary{
  background:#1a73e8;
  color:white;
}

.alert-error{
  color:#b00020;
  font-size:13px;
  margin-bottom:10px;
}

</style>
