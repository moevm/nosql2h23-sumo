<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="1" @click="download">
          <upload-outlined />
          <span>Массовый экспорт</span>
        </a-menu-item>
        <a-menu-item key="2" @click="upload">
          <download-outlined />
          <span>Массовый импорт</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0" />
      <a-layout-content style="margin: 0 16px">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          Content
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        sumo nosql ©2023
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>

import { ref } from 'vue';
import axios from "axios";
const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>(['1']);

const upload = async () => {
  try {
    console.log('123');

    const response = await axios.post('http://localhost:3000/api/upload-backup');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

const download = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/download-backup');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};
</script>
<style scoped>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>
