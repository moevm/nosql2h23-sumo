<template>
  <div>
    <a-page-header
        :title="'Статистика экспериментов'"
        class="site-page-header"
    >
      <template #extra>
        <a-button type="primary" @click="goBack">Назад</a-button>
      </template>
    </a-page-header>
    <a-table :dataSource="statistics" :columns="columns" />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const columns = [
  {
    title: 'Название статистики',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Значение статистики',
    dataIndex: 'value',
    key: 'value'
  }
]

const statistics = reactive([])

onMounted(async () => {
  const url = 'http://localhost:3000/api/experiments-stats'

  try {
    const response = await axios.get(url)
    const stats = response.data
    for (const stat in stats) {
      statistics.push({
        key: stat,
        name: translateStatName(stat),
        value: stats[stat]
      })
    }
  } catch (err) {
    console.error(err)
  }
})

function translateStatName(statName) {
  switch (statName) {
    case 'totalExperiments':
      return 'Количество экспериментов'
    case 'totalEdges':
      return 'Количество ребер'
    case 'totalNodes':
      return 'Количество узлов'
    default:
      return statName
  }
}
function goBack() {
  router.go(-1)
}
</script>

<style scoped>
</style>
