<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="1" @click="download">
          <upload-outlined />
          <span>Массовый экспорт</span>
        </a-menu-item>
        <a-menu-item key="2" @click="triggerFileSelect">
          <download-outlined />
          <span>Массовый импорт</span>
          <input type="file" ref="fileInput" style="display: none" @change="upload" />
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

const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileSelect = () => {
  fileInput.value?.click();
};

const upload = async () => {
  if (fileInput.value?.files?.length) {
    const file = fileInput.value.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const data = JSON.parse(content);
          const response = await axios.post('http://localhost:3000/api/upload-backup', data);
          notification.open({
            type: 'success',
            message: 'Upload Successful',
            description: 'The Backup file has been uploaded successfully.'
          });
        }
      } catch (error) {
        notification.open({
          type: 'error',
          message: 'Upload Failed',
          description: 'An error occurred while uploading the file.'
        });
      }
    };
    reader.readAsText(file);
  }
};

const download = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/download-backup', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const date = new Date();
    link.setAttribute('download', `backup-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.json`);    document.body.appendChild(link);
    link.click();
    notification.open({
      type: 'success',
      message: 'Download Successful',
      description: 'The backup has been downloaded successfully.'
    });
  } catch (error) {
    notification.open({
      type: 'error',
      message: 'Download Failed',
      description: 'An error occurred while downloading the backup.'
    });
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
