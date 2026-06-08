<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProviderStore } from '../stores/providers';

const store = useProviderStore();
const { providers } = storeToRefs(store);
</script>

<template>
  <div data-test="dev-data-view">
    <h2>{{ providers.length.toLocaleString() }} providers loaded</h2>
    <table>
      <thead>
        <tr>
          <th>name</th>
          <th>licenseType</th>
          <th>capacity</th>
          <th>city</th>
          <th>county</th>
          <th>lat</th>
          <th>lng</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in providers" :key="p.id">
          <td>{{ p.name }}</td>
          <td>{{ p.licenseType }}</td>
          <td>{{ p.capacity }}</td>
          <td>{{ p.city }}</td>
          <td>{{ p.county }}</td>
          <td>{{ p.lat }}</td>
          <td>{{ p.lng }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
