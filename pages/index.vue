<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo"></div>
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
        <a-menu-item key="3" @click="navigateToStats">
          <bar-chart-outlined />
          <span>Статистика экспериментов</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">


      </a-layout-header>

      <a-layout-content style="margin: 0 16px">

        <a-input :placeholder="'Поиск по названию эксперимента'" v-model:value="filterText" @change="handleFilter" style="margin-bottom: 12px;margin-top: 12px"></a-input>

        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <a-button @click="openFilterModal" type="primary" style="margin-bottom: 12px">
            Применить фильтры
          </a-button>
          <a-button type="primary" @click="openModal" :style="{float: 'right', marginBottom: '12px'}">Импорт эксперимента</a-button>

          <a-table
              :columns="columns"
              :data-source="experiments"
              :pagination="pagination"
              @change="handleTableChange"
              v-bind="{customRow: onRow}"
          >
          </a-table>
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        sumo nosql ©2023
      </a-layout-footer>
    </a-layout>
    <a-modal v-model:visible="filterModalVisible" title="Фильтр экспериментов" @ok="applyFilters">
      <a-form @submit="submitForm">
        <a-form-item label="ID эксперимента">
          <a-input v-model:value="filterExperimentId"/>
        </a-form-item>
        <a-form-item label="Диапазон дат">
          <a-range-picker v-model:value="filterDateRange" />
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model:open="modalVisible" title="Импорт эксперимента" @ok="submitForm">
      <a-form @submit="submitForm">
        <a-form-item label="Название эксперимента" required>
          <a-input v-model="experimentNameTextFieldValue" v-model:value="experimentNameTextFieldValue"/>
        </a-form-item>
          <a-form-item label="Вершины" required>
            <a-input v-model="nodesTextFieldValue" v-model:value="nodesTextFieldValue"/>
          </a-form-item>
          <a-form-item label="Ребра" required>
            <a-input v-model="edgesTextFieldValue"  v-model:value="edgesTextFieldValue"/>
          </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>
<script lang="ts">
import axios from 'axios';
import {UploadProps} from "ant-design-vue";
const fileList = ref<UploadProps['fileList']>([]);
export default {
  data() {
    return {
      filterModalVisible: false,
      filterExperimentId: '',
      filterDateRange: ['', ''],
      filterText: '',
      experiments: [],
      pagination: {
        current: 1,
        pageSize: 5,
        total: 0,
      },
      columns: [
        {
          title: 'Id',
          dataIndex: 'id',
        },
        {
          title: 'Название эксперимента',
          dataIndex: 'experimentName',
        },

        {
          title: 'Дата создания',
          dataIndex: 'date',
        },
      ],
      modalVisible: false,
      experimentNameTextFieldValue: '',
      nodesTextFieldValue: '',
      edgesTextFieldValue: '',

    };
  },
  methods: {
    openFilterModal() {
      this.filterModalVisible = true;
    },
    applyFilters() {
      this.filterModalVisible = false;
      this.fetchExperiments();
    },
    navigateToStats() {
      this.$router.push('/statistics');
    },
    navigateToExperiment(record) {
      this.$router.push(`/experiments/${record.id}`);
    },
    onRow(record) {
      return {
        onClick: event => {
          this.navigateToExperiment(record)
        },
      };
    },
    handleTableChange(pagination) {
      this.pagination = pagination;
      this.fetchExperiments();
    },
    fetchExperiments() {
      const url = 'http://localhost:3000/api/experiments';
      const params = {
        page: this.pagination.current,
        size: this.pagination.pageSize,
        experimentName: this.filterText,
        experimentId: this.filterExperimentId,
        startDate: this.filterDateRange[0],
        endDate: this.filterDateRange[1],
      };
      console.log(this.filterText)
      console.log(JSON.stringify(this.pagination))

      axios.get(url, { params })
          .then(response => {
            this.experiments = response.data.experiments;
            this.pagination.total = response.data.totalExperiments;
          })
          .catch(error => {
            console.error('Error fetching experiments:', error);
          });
    },
    triggerFileSelect() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(e) {
      const file = e.target.files[0];
      // Implement your file upload logic here
    },
    openModal(){
      console.log('modal opened')
      this.modalVisible = true
    },
    async submitForm() {
      if (!this.experimentNameTextFieldValue || !this.nodesTextFieldValue || !this.edgesTextFieldValue){
        return
      }
      console.log("submit", this.experimentNameTextFieldValue, this.nodesTextFieldValue, this.edgesTextFieldValue)
      try {
          const data = {
            nodes: btoa(this.nodesTextFieldValue),
            edges: btoa(this.edgesTextFieldValue),
            experimentName: this.experimentNameTextFieldValue
          }
          const response = await axios.post('http://localhost:3000/api/import-experiment', data);
          notification.open({
            type: 'success',
            message: 'Успех',
            description: ''
          });
      } catch (error) {
        notification.open({
          type: 'error',
          message: 'Ошибка',
          description: ''
        });
      }
      this.fetchExperiments()
      this.modalVisible = false
    },
    customRequest() {
      // Handle custom request logic here
    },
    handleFilter() {
      console.log("filter")

      this.fetchExperiments()

    }
  },
  mounted() {
    console.log("mounted")
    this.fetchExperiments();
  },
};
</script>
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
            message: 'Успех',
            description: ''
          });
        }
      } catch (error) {
        notification.open({
          type: 'error',
          message: 'Ошибка',
          description: ''
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
      message: 'Успех',
      description: ''
    });
  } catch (error) {
    notification.open({
      type: 'error',
      message: 'Ошибка',
      description: ''
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
